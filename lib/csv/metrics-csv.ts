import { channel } from "node:diagnostics_channel";
import "server-only";

export const REQUIRED_METRICS_CSV_HEADERS=[
    "date",
    "channel",
    "campaign",
    "sessions",
    "impressions",
    "clicks",
    "conversions",
    "spend",
    "revenue",
] as const;

type MetricsCsvHeader = (typeof REQUIRED_METRICS_CSV_HEADERS)[number];
type RawMetricCsvRecord = Record<MetricsCsvHeader,string>;

function normalizeHeader(value:string){
    return value.trim().toLowerCase();
}

export function normalizeMetricCsvHeaders(headers:string[]){
    const normalizedHeader = headers.map(normalizeHeader);

    const missingHeaders=REQUIRED_METRICS_CSV_HEADERS.filter(
        (requiredHeader) => !normalizedHeader.includes(requiredHeader)
    );

    if (missingHeaders.length>0){
        throw new Error(`CSV is missing required columns: ${missingHeaders.join(", ")}`);
    }
    return normalizedHeader;
}

function normalizeNullableText(value:string | undefined){
    const trimmed = value?.trim();
    return trimmed ? trimmed:null;
}

function parseInteger(value:string | undefined,fieldName:string,rowNumber:number){
    const normalized = (value??"").trim().replace(/,/g,"");

    if(normalized===""){
        return 0;
    }

    if (!/^-?\d+$/.test(normalized)) {
        throw new Error(`Row ${rowNumber}: "${fieldName}" must be an integer`);
    }

    return Number.parseInt(normalized,10);
}

function parseMoney(value:string | undefined,fieldName:string,rowNumber:number){
    const normalized = (value ?? "").trim().replace(/\$/g, "").replace(/,/g, "");

    if(normalized === ""){
        return "0.00";
    }

    const parsed = Number(normalized);

    if(!Number.isFinite(parsed)){
        throw new Error(`Row ${rowNumber}: "${fieldName}" must be a valid number`);
    }

    return parsed.toFixed(2);
}

function parseIsoDate(value:string | undefined,rowNumber:number){
    const normalized = (value ?? "").trim();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
        throw new Error(`Row ${rowNumber}: "date" must use YYYY-MM-DD format`);
    }

    return new Date(`${normalized}T00:00:00.000Z`);
}

export function normalizeMetricCsvRecord(args:{
    record:Record<string,string>;
    organizationId:string;
    dataSourceId:string;
    rowNumber:number;
}){
    const {record,organizationId,dataSourceId,rowNumber} = args;

    const typedRecord = record as RawMetricCsvRecord;

    return {
        organizationId,
        dataSourceId,
        date:parseIsoDate(typedRecord.date,rowNumber),
        channel:normalizeNullableText(typedRecord.channel),
        campaign: normalizeNullableText(typedRecord.campaign),
        sessions: parseInteger(typedRecord.sessions, "sessions", rowNumber),
        impressions: parseInteger(typedRecord.impressions, "impressions", rowNumber),
        clicks: parseInteger(typedRecord.clicks, "clicks", rowNumber),
        conversions: parseInteger(typedRecord.conversions, "conversions", rowNumber),
        spend: parseMoney(typedRecord.spend, "spend", rowNumber),
        revenue: parseMoney(typedRecord.revenue, "revenue", rowNumber),
    };
}