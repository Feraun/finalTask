import { ClearOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Card, Input, Select, Space } from 'antd'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { resetFilters, setFilters } from './tasksSlice'
import { debounce } from '../../utils/debounce'
import { useMemo, useState } from 'react'

export const TaskFiltersBar = () => {
  const dispatch = useAppDispatch()
  const { filters } = useAppSelector((state) => state.tasks)
  const [search, setSearch] = useState(filters.q)

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        dispatch(setFilters({ q: value }))
      }, 300),
    [dispatch],
  )

  return (
    <Card className="filters-card">
      <Space className="filters-row" wrap>
        <Input
          allowClear
          className="search-input"
          prefix={<SearchOutlined />}
          placeholder="Поиск по названию"
          value={search}
          onChange={(event) => {
            const value = event.target.value
            setSearch(value)
            debouncedSearch(value)
            }}
        />
        <Select
          className="sort-select"
          value={`${filters.sort}:${filters.order}`}
          options={[
            { label: 'Обновлены недавно', value: 'updatedAt:desc' },
            { label: 'Обновлены давно', value: 'updatedAt:asc' },
            { label: 'Название А-Я', value: 'title:asc' },
            { label: 'Название Я-А', value: 'title:desc' },
          ]}
          onChange={(value) => {
            const [sort, order] = value.split(':')
            dispatch(setFilters({ sort: sort as 'createdAt' | 'updatedAt' | 'title', order: order as 'asc' | 'desc' }))
          }}
        />
        <Button icon={<ClearOutlined />} onClick={() => dispatch(resetFilters())}>
          Сбросить
        </Button>
      </Space>
    </Card>
  )
}
