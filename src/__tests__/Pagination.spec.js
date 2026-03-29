import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import Pagination from '../components/Pagination.vue';

describe('Pagination.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        totalPages: 10
      }
    });
  });

  it('рендерит навигацию', () => {
    expect(wrapper.find('nav').exists()).toBe(true);
    expect(wrapper.find('ul.pagination').exists()).toBe(true);
  });

  it('кнопка "Предыдущая" disabled на первой странице', () => {
    const prevButton = wrapper.findAll('li.page-item')[0];
    expect(prevButton.classes()).toContain('disabled');
  });

  it('кнопка "Следующая" не disabled на первой странице', () => {
    const items = wrapper.findAll('li.page-item');
    const nextButton = items[items.length - 1];
    expect(nextButton.classes()).not.toContain('disabled');
  });

  it('эмитит событие page-change при клике на страницу 3', async () => {
    const pageLinks = wrapper.findAll('a.page-link');
    const page3Link = pageLinks.find(el => el.text() === '3');
    await page3Link.trigger('click');
    
    expect(wrapper.emitted('page-change')).toBeTruthy();
    expect(wrapper.emitted('page-change')[0]).toEqual([3]);
  });

  it('корректно работает при totalPages = 1', () => {
    const singlePageWrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        totalPages: 1
      }
    });
    
    const items = singlePageWrapper.findAll('li.page-item');
    const nextButton = items[items.length - 1];
    expect(nextButton.classes()).toContain('disabled');
  });
});