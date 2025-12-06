import type { ReactNode } from 'react'

type Column<T> = {
  key: string
  label: string
  render?: (row: T) => ReactNode
}

type TableProps<T> = {
  data: T[]
  columns: Column<T>[]
  getKey?: (row: T, index: number) => string | number
  emptyMessage?: string
}

const Table = <T,>({
  data,
  columns,
  getKey = (_row, index) => index,
  emptyMessage = 'Nenhum registro encontrado.',
}: TableProps<T>) => {
  if (!data.length) {
    return <div className="table-empty">{emptyMessage}</div>
  }

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={getKey(row, index)}>
            {columns.map((col) => (
              <td key={col.key}>
                {col.render
                  ? col.render(row)
                  : ((row as Record<string, unknown>)[col.key] as ReactNode)}
              </td>
            ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table
