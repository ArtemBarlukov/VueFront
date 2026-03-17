import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import PostItem from '../components/PostItem.vue';

// Мокаем UI компоненты с правильными путями
vi.mock('@/components/UI/MyButton.vue', () => ({
  default: {
    name: 'MyButton',
    template: '<button class="my-button" data-testid="my-button" @click="$emit(\'click\')"><slot /></button>',
    emits: ['click']
  }
}));

describe('PostItem.vue', () => {
  let wrapper;
  const mockPost = {
    id: 1,
    title: 'Тестовый пост',
    body: 'Тестовое описание поста'
  };

  beforeEach(() => {
    wrapper = mount(PostItem, {
      props: {
        post: mockPost
      }
    });
  });

  it('рендерит пост с правильными данными', () => {
    expect(wrapper.text()).toContain('Название:Тестовый пост');
    expect(wrapper.text()).toContain('Описание:Тестовое описание поста');
  });

  it('рендерит кнопку удаления', () => {
    const button = wrapper.find('button.my-button');
    expect(button.exists()).toBe(true);
    expect(button.text()).toBe('Удалить');
  });

  it('эмитит событие remove с постом при клике на удаление', async () => {
    const button = wrapper.find('button.my-button');
    await button.trigger('click');
    
    expect(wrapper.emitted('remove')).toBeTruthy();
    expect(wrapper.emitted('remove')[0][0]).toEqual(mockPost);
  });

  it('имеет правильную структуру классов', () => {
    expect(wrapper.find('.post').exists()).toBe(true);
    expect(wrapper.find('.post__btn').exists()).toBe(true);
  });
});