import {z} from "zod";
import { ActiveJobsAutoRefresh } from "@/components/data-source/active-jobs-auto-refresh";
import { CsvUploadForm } from "@/components/data-source/csv-upload-form";
import { requireOrgMembership } from "@/lib/auth/require-org-membership";
import { getDataSourcePageData } from "@/lib/queries/data-source";
import { formatDateTime } from "@/lib/utils/date";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const StoredCsvCredentialSchema = z.object({
    type:z.literal("csv-upload"),
    fileKey:z.string(),
    originalFileName:z.string(),
    sizeInBytes:z.number(),
    uploadedAt:z.string(),
    format: z.literal("strict-v1"),
});

function readStoredCsvCredentials(value:unknown){
    const parsed = StoredCsvCredentialSchema.safeParse(value);
    return parsed.success ? parsed.data : null;
}

function formatBytes(bytes: number | null | undefined){
    if(!bytes || bytes <=0)return "-";

    const units = ["B","KB","MB","GB"];
    let value =bytes;
    let unitIndex = 0;

    while (value>=1024 && unitIndex < units.length - 1){
        value /= 1024;
        unitIndex += 1;
    }

    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

