import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import PostForm from '../components/PostForm.vue';


// Мокаем UI компоненты с правильными путями
vi.mock('@/components/UI/MyInput.vue', () => ({
  default: {
    name: 'MyInput',
    template: '<input class="my-input" data-testid="my-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'type', 'placeholder']
  }
}));

vi.mock('@/components/UI/MyButton.vue', () => ({
  default: {
    name: 'MyButton',
    template: '<button class="my-button" data-testid="my-button" @click="$emit(\'click\')"><slot /></button>',
    emits: ['click']
  }
}));

describe('PostForm.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(PostForm, {
      global: {
        // Не используем stubs, так как уже замокали компоненты
      }
    });
  });

  it('рендерит форму с заголовком', () => {
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('h4').text()).toBe('Создание поста');
  });

  it('рендерит два поля ввода', () => {
    // Ищем input'ы по data-testid или классу
    const inputs = wrapper.findAll('input.my-input');
    expect(inputs.length).toBe(2);
  });

  it('рендерит кнопку создания', () => {
    const button = wrapper.find('button.my-button');
    expect(button.exists()).toBe(true);
    expect(button.text()).toBe('Создать');
  });

  it('обновляет данные при вводе в поля', async () => {
    const inputs = wrapper.findAll('input.my-input');
    
    // Устанавливаем значения через input событие
    await inputs[0].setValue('Тестовый заголовок');
    await inputs[1].setValue('Тестовое описание');
    
    expect(wrapper.vm.post.title).toBe('Тестовый заголовок');
    expect(wrapper.vm.post.body).toBe('Тестовое описание');
  });

  it('эмитит событие create с правильными данными при отправке', async () => {
    const inputs = wrapper.findAll('input.my-input');
    
    await inputs[0].setValue('Тестовый заголовок');
    await inputs[1].setValue('Тестовое описание');
    
    const button = wrapper.find('button.my-button');
    await button.trigger('click');
    
    expect(wrapper.emitted('create')).toBeTruthy();
    const emittedData = wrapper.emitted('create')[0][0];
    
    expect(emittedData.title).toBe('Тестовый заголовок');
    expect(emittedData.body).toBe('Тестовое описание');
    expect(emittedData.id).toBeDefined();
  });

  it('очищает поля после создания поста', async () => {
    const inputs = wrapper.findAll('input.my-input');
    
    await inputs[0].setValue('Тестовый заголовок');
    await inputs[1].setValue('Тестовое описание');
    
    const button = wrapper.find('button.my-button');
    await button.trigger('click');
    
    expect(wrapper.vm.post.title).toBe('');
    expect(wrapper.vm.post.body).toBe('');
  });
});