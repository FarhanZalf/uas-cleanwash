export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex min-h-[44px] items-center justify-center rounded-lg border border-transparent bg-[#0D9488] px-4 py-2 text-xs font-bold text-white transition duration-150 ease-in-out hover:bg-[#134E4A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2 active:bg-[#0f3b38] ${
                    disabled ? 'opacity-50' : ''
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
