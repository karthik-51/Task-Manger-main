export default function Pagination({ page, setPage }) {
  return (
    <div className="flex gap-2 mt-4">
      <button
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
        className="px-3 py-1 bg-gray-300"
      >
        Prev
      </button>
      <button
        onClick={() => setPage(page + 1)}
        className="px-3 py-1 bg-gray-300"
      >
        Next
      </button>
    </div>
  );
}