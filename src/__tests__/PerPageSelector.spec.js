import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import PerPageSelector from '../components/PerPageSelector.vue';

describe('PerPageSelector.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(PerPageSelector, {
      props: {
        modelValue: 25,
        options: [10, 25, 50, 100]
      }
    });
  });

  it('рендерит select с правильными опциями', () => {
    const select = wrapper.find('select');
    const options = wrapper.findAll('option');
    
    expect(select.exists()).toBe(true);
    expect(options.length).toBe(4);
    expect(options[0].text()).toBe('10');
    expect(options[1].text()).toBe('25');
    expect(options[2].text()).toBe('50');
    expect(options[3].text()).toBe('100');
  });

  it('правильно отображает выбранное значение', () => {
    const select = wrapper.find('select');
    expect(select.element.value).toBe('25');
  });

  it('эмитит события при изменении значения', async () => {
    const select = wrapper.find('select');
    await select.setValue('50');
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([50]);
    expect(wrapper.emitted('change')).toBeTruthy();
    expect(wrapper.emitted('change')[0]).toEqual([50]);
  });

  it('обновляет выбранное значение при изменении props', async () => {
    await wrapper.setProps({ modelValue: 50 });
    const select = wrapper.find('select');
    expect(select.element.value).toBe('50');
  });

  it('использует опции по умолчанию, если не переданы', () => {
    const defaultWrapper = mount(PerPageSelector, {
      props: {
        modelValue: 10
      }
    });
    
    const options = defaultWrapper.findAll('option');
    expect(options.length).toBe(4);
    expect(options[0].text()).toBe('10');
    expect(options[1].text()).toBe('25');
  });

  it('корректно работает с пользовательскими опциями', () => {
    const customWrapper = mount(PerPageSelector, {
      props: {
        modelValue: 5,
        options: [5, 15, 30]
      }
    });
    
    const options = customWrapper.findAll('option');
    expect(options.length).toBe(3);
    expect(options[0].text()).toBe('5');
    expect(options[1].text()).toBe('15');
    expect(options[2].text()).toBe('30');
  });
});