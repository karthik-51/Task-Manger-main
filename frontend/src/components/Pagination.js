
export default function Pagination({ page, setPage }) {
  const prev = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };
  const next = () => {
    setPage(page + 1);
  };

  return (
    <div className="flex gap-2 mt-4">
      <button
        onClick={prev}
        disabled={page === 1}
        className="px-3 py-1 bg-gray-300"
      >
        Prev
      </button>
      <button
        onClick={next}
        className="px-3 py-1 bg-gray-300"
      >
        Next
      </button>
    </div>
  );
}