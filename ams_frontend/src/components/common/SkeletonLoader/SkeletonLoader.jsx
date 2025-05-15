const SkeletonLoader = ({ rows, columns }) => {
  return (
    <>
      {[...Array(rows)].map((_, rowIndex) => (
        <tr key={rowIndex} className="animate-pulse">
          {[...Array(columns)].map((_, cellIndex) => (
            <td
              key={cellIndex}
              className="px-2 py-4 border border-gray-300"
              style={{
                maxWidth: "180px",
                minWidth: "120px",
                overflowWrap: "break-word",
              }}
            >
              <div className="h-4 bg-gray-300 rounded w-full"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default SkeletonLoader;
