import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/require-authenticated-user";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    const { jobId } = await params;

    const user = await requireAuthenticatedUser();

    const job = await prisma.syncJob.findUnique({
        where: { id: jobId },
        select: {
            id: true,
            organizationId: true,
            status: true,
            progress: true,
            message: true,
            createdAt: true,
            finishedAt: true,
            organization: {
                select: {
                    membership: {
                        where: { userId: user.id },
                        select: { role: true },
                    },
                },
            },
        },
    });

    if (!job) {
        return new Response("Not found", { status: 404 });
    }

    if (job.organization.membership.length === 0) {
        return new Response("Forbidden", { status: 403 });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller) {
            let closed = false;
            let interval: ReturnType<typeof setInterval> | null = null;
            let closeTimeout: ReturnType<typeof setTimeout> | null = null;

            function close() {
                if (closed) return;
                closed = true;

                if (interval) {
                    clearInterval(interval);
                    interval = null;
                }

                if (closeTimeout) {
                    clearTimeout(closeTimeout);
                    closeTimeout = null;
                }

                try {
                    controller.close();
                } catch {
                    // Already closed
                }
            }

            async function sendUpdate() {
                if (closed) return;

                const updated = await prisma.syncJob.findUnique({
                    where: { id: jobId },
                    select: {
                        id: true,
                        status: true,
                        progress: true,
                        message: true,
                        createdAt: true,
                        finishedAt: true,
                    },
                });

                if (closed) return;

                if (!updated) {
                    close();
                    return;
                }

                try {
                    const payload = JSON.stringify(updated);
                    controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
                } catch {
                    close();
                    return;
                }

                if (updated.status === "SUCCESS" || updated.status === "FAILED") {
                    /**
                     * Stop the polling interval immediately so we don't send duplicates.
                     * But delay the actual stream close by 2 seconds.
                     *
                     * Why: fast jobs finish before the client EventSource fully connects.
                     * The 2s window gives the browser time to receive the final state message.
                     */
                    if (interval) {
                        clearInterval(interval);
                        interval = null;
                    }

                    closeTimeout = setTimeout(() => {
                        close();
                    }, 2000);
                }
            }

            sendUpdate();

            interval = setInterval(sendUpdate, 1500);

            request.signal.addEventListener("abort", () => {
                close();
            });
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
        },
    });
}