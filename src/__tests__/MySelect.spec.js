import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import MySelect from '../components/UI/MySelect.vue';

describe('MySelect.vue', () => {
  const mockOptions = [
    { value: '1', name: 'Опция 1' },
    { value: '2', name: 'Опция 2' },
    { value: '3', name: 'Опция 3' }
  ];

  let wrapper;

  beforeEach(() => {
    wrapper = mount(MySelect, {
      props: {
        modelValue: '',
        options: mockOptions
      }
    });
  });

  it('рендерит select с правильными опциями', () => {
    const select = wrapper.find('select');
    const options = wrapper.findAll('option');
    
    expect(select.exists()).toBe(true);
    // +1 для disabled опции "Выберите из списка"
    expect(options.length).toBe(mockOptions.length + 1);
  });

  it('отображает disabled опцию по умолчанию', () => {
    const firstOption = wrapper.findAll('option')[0];
    expect(firstOption.text()).toBe('Выберите из списка');
    expect(firstOption.attributes('disabled')).toBeDefined();
    expect(firstOption.element.value).toBe('');
  });

  it('отображает все переданные опции', () => {
    const options = wrapper.findAll('option').slice(1); // пропускаем первую опцию
    
    options.forEach((option, index) => {
      expect(option.text()).toBe(mockOptions[index].name);
      expect(option.element.value).toBe(mockOptions[index].value);
    });
  });

  it('отображает выбранное значение', async () => {
    await wrapper.setProps({ modelValue: '2' });
    
    const select = wrapper.find('select');
    expect(select.element.value).toBe('2');
  });

  it('эмитит событие update:modelValue при выборе опции', async () => {
    const select = wrapper.find('select');
    await select.setValue('2');
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['2']);
  });

  it('обновляет локальное значение при изменении modelValue', async () => {
    expect(wrapper.vm.localValue).toBe('');
    
    await wrapper.setProps({ modelValue: '3' });
    expect(wrapper.vm.localValue).toBe('3');
  });

  it('работает с пустым массивом опций', () => {
    const emptyWrapper = mount(MySelect, {
      props: {
        modelValue: '',
        options: []
      }
    });
    
    const options = emptyWrapper.findAll('option');
    expect(options.length).toBe(1); // Только disabled опция
    expect(options[0].text()).toBe('Выберите из списка');
  });

  it('имеет правильное имя компонента', () => {
    expect(wrapper.vm.$options.name).toBe('MySelect');
  });
});