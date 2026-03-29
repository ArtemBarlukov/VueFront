import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import MyInput from '../components/UI/MyInput.vue';

describe('MyInput.vue', () => {
  it('рендерит input с правильным классом', () => {
    const wrapper = mount(MyInput);
    const input = wrapper.find('input');
    
    expect(input.exists()).toBe(true);
    expect(input.classes()).toContain('input');
  });

  it('отображает переданное значение через modelValue', () => {
    const wrapper = mount(MyInput, {
      props: {
        modelValue: 'Тестовый текст'
      }
    });
    
    const input = wrapper.find('input');
    expect(input.element.value).toBe('Тестовый текст');
  });

  it('эмитит событие update:modelValue при вводе текста', async () => {
    const wrapper = mount(MyInput);
    const input = wrapper.find('input');
    
    await input.setValue('Новый текст');
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['Новый текст']);
  });

  it('обновляет значение при изменении props', async () => {
    const wrapper = mount(MyInput, {
      props: {
        modelValue: 'Начальное значение'
      }
    });
    
    expect(wrapper.find('input').element.value).toBe('Начальное значение');
    
    await wrapper.setProps({ modelValue: 'Обновленное значение' });
    expect(wrapper.find('input').element.value).toBe('Обновленное значение');
  });

  it('принимает числовые значения', () => {
    const wrapper = mount(MyInput, {
      props: {
        modelValue: 123
      }
    });
    
    const input = wrapper.find('input');
    expect(input.element.value).toBe('123');
  });

  it('имеет правильное имя компонента', () => {
    const wrapper = mount(MyInput);
    expect(wrapper.vm.$options.name).toBe('MyInput');
  });
});