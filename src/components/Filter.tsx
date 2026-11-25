import { useEffect, type ChangeEvent } from 'react';
import { useShopStore } from '../store/useShopStore';

export default function Filter() {
  const categories = useShopStore((state) => state.categories);
  const filters = useShopStore((state) => state.filters);
  const fetchCategories = useShopStore((state) => state.fetchCategories);
  const setFilters = useShopStore((state) => state.setFilters);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value });
  };

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters({ categoryId: value ? Number(value) : undefined });
  };

  const handlePriceSortChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'asc' | 'desc' | '';
    setFilters({ sortByPrice: value || undefined });
  };

  return (
    <div className="filters">
      <input
        type="text"
        className="search__input"
        placeholder="Поиск по названию и описанию..."
        value={filters.search ?? ''}
        onChange={handleSearchChange}
      />

      <div className="filters">
        <select
          name="category"
          id="category"
          className="filters__select"
          value={filters.categoryId ?? ''}
          onChange={handleCategoryChange}
        >
          <option value="">Все категории</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          name="price"
          id="price"
          className="filters__select"
          value={filters.sortByPrice ?? 'asc'}
          onChange={handlePriceSortChange}
        >
          <option value="asc">Цена: по возр.</option>
          <option value="desc">Цена: по убыв.</option>
        </select>
      </div>
    </div>
  );
}