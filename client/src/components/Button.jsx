export default function Button({ children, ...rest }) {
  return (
    <button
      className="w-full rounded-xl bg-blue-600 text-white font-medium py-2.5 hover:bg-blue-700 active:translate-y-px transition"
      {...rest}
    >
      {children}
    </button>
  );
}
