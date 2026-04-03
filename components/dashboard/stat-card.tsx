export function StatCard({title,value,description}:{title:string;value:string;description:string;}){
    return (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 bg-white p-5 shadow-sm">{title}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">{value}</p>
            <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
        </section>
    );
}