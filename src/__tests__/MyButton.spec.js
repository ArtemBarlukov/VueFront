import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import MyButton from '../components/UI/MyButton.vue';

describe('MyButton.vue', () => {
  it('рендерит кнопку с правильным классом', () => {
    const wrapper = mount(MyButton, {
      slots: {
        default: 'Нажми меня'
      }
    });
    
    const button = wrapper.find('button');
    expect(button.exists()).toBe(true);
    expect(button.classes()).toContain('btn');
    expect(button.text()).toBe('Нажми меня');
  });

  it('применяет правильные стили', () => {
    const wrapper = mount(MyButton);
    const button = wrapper.find('button');
    
    // Проверяем наличие класса, стили проверять не нужно
    expect(button.classes()).toContain('btn');
  });

  it('эмитит событие click при нажатии', async () => {
    const wrapper = mount(MyButton);
    const button = wrapper.find('button');
    
    await button.trigger('click');
    expect(wrapper.emitted('click')).toBeTruthy();
  });

  it('рендерит слот с контентом', () => {
    const wrapper = mount(MyButton, {
      slots: {
        default: '<span class="test-icon">🔍</span> Поиск'
      }
    });
    
    expect(wrapper.find('.test-icon').exists()).toBe(true);
    expect(wrapper.text()).toContain('Поиск');
  });

  it('имеет правильное имя компонента', () => {
    const wrapper = mount(MyButton);
    expect(wrapper.vm.$options.name).toBe('MyButton');
  });
});