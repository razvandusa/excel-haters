import { useEffect, useMemo, useState } from 'react'

export const DEFAULT_PAGE_SIZE = 7

export default function useTablePagination(items, pageSize = DEFAULT_PAGE_SIZE) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages))
  }, [totalPages])

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize

    return items.slice(startIndex, startIndex + pageSize)
  }, [currentPage, items, pageSize])

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems,
  }
}
