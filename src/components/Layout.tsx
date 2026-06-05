export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="mx-auto">{children}</main>
    </div>
  );
}
