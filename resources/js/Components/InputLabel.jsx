export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-xs font-bold text-[#134E4A] ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
