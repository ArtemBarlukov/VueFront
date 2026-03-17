import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import ChartFilter from '../components/ChartFilter.vue';

describe('ChartFilter.vue', () => {
  let wrapper;
  const mockCategories = ['Категория 1', 'Категория 2', 'Категория 3'];

  beforeEach(() => {
    wrapper = mount(ChartFilter, {
      props: {
        categories: mockCategories
      }
    });
  });

  it('рендерит заголовок', () => {
    expect(wrapper.find('h3').exists()).toBe(true);
    expect(wrapper.find('h3').text()).toBe('Фильтр по категориям');
  });

  it('рендерит select с правильным количеством опций', () => {
    const select = wrapper.find('select');
    const options = wrapper.findAll('option');
    
    expect(select.exists()).toBe(true);
    // +1 для пустой опции "Все категории"
    expect(options.length).toBe(mockCategories.length + 1);
  });

  it('первая опция - пустая для всех категорий', () => {
    const firstOption = wrapper.findAll('option')[0];
    expect(firstOption.text()).toBe('Все категории');
    expect(firstOption.element.value).toBe('');
  });

  it('отображает все переданные категории', () => {
    const options = wrapper.findAll('option');
    
    mockCategories.forEach((category, index) => {
      expect(options[index + 1].text()).toBe(category);
      expect(options[index + 1].element.value).toBe(category);
    });
  });

  it('эмитит событие update-category при выборе категории', async () => {
    const select = wrapper.find('select');
    await select.setValue('Категория 1');
    
    expect(wrapper.emitted('update-category')).toBeTruthy();
    expect(wrapper.emitted('update-category')[0]).toEqual(['Категория 1']);
  });

  it('эмитит событие с пустой строкой при выборе "Все категории"', async () => {
    const select = wrapper.find('select');
    await select.setValue(''); // Выбираем "Все категории"
    
    expect(wrapper.emitted('update-category')[0]).toEqual(['']);
  });

  it('корректно работает с пустым массивом категорий', () => {
    const emptyWrapper = mount(ChartFilter, {
      props: {
        categories: []
      }
    });
    
    const options = emptyWrapper.findAll('option');
    expect(options.length).toBe(1); // Только "Все категории"
    expect(options[0].text()).toBe('Все категории');
  });
});