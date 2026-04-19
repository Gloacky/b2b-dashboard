export function StatCard({title,value,description,trend}:{title:string;value:string;description?:string;trend?:{value:number;label:string;};}){
    return (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 bg-white p-5">{title}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">{value}</p>
            
            {trend ? (
                <p className={`mt-2 text-sm font-medium ${trend.value >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {trend.value >= 0 ? "+":""}
                    {trend.value.toFixed(1)}%{trend.label}
                </p>
            ):null}

            {description ? (
                <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
            ):null}
        </section>
    );
}