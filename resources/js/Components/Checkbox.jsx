export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-slate-300 text-[#0D9488] focus:ring-[#0D9488] ' +
                className
            }
        />
    );
}
