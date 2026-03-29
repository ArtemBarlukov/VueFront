import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import MyDialog from '../components/UI/MyDialog.vue';

describe('MyDialog.vue', () => {
  it('не отображается когда show=false', () => {
    const wrapper = mount(MyDialog, {
      props: {
        show: false
      }
    });
    
    expect(wrapper.find('.dialog').exists()).toBe(false);
  });

  it('отображается когда show=true', () => {
    const wrapper = mount(MyDialog, {
      props: {
        show: true
      }
    });
    
    expect(wrapper.find('.dialog').exists()).toBe(true);
    expect(wrapper.find('.dialog_content').exists()).toBe(true);
  });

  it('отображает слот с контентом', () => {
    const wrapper = mount(MyDialog, {
      props: {
        show: true
      },
      slots: {
        default: '<div class="test-content">Содержимое диалога</div>'
      }
    });
    
    expect(wrapper.find('.test-content').exists()).toBe(true);
    expect(wrapper.text()).toContain('Содержимое диалога');
  });

  it('эмитит update:show при клике на оверлей', async () => {
    const wrapper = mount(MyDialog, {
      props: {
        show: true
      }
    });
    
    const overlay = wrapper.find('.dialog');
    await overlay.trigger('click');
    
    expect(wrapper.emitted('update:show')).toBeTruthy();
    expect(wrapper.emitted('update:show')[0]).toEqual([false]);
  });

  it('НЕ эмитит update:show при клике на контент', async () => {
    const wrapper = mount(MyDialog, {
      props: {
        show: true
      }
    });
    
    const content = wrapper.find('.dialog_content');
    await content.trigger('click');
    
    expect(wrapper.emitted('update:show')).toBeFalsy();
  });

  it('использует значение по умолчанию для show', () => {
    const wrapper = mount(MyDialog);
    expect(wrapper.props('show')).toBe(false);
    expect(wrapper.find('.dialog').exists()).toBe(false);
  });

  it('имеет правильное имя компонента', () => {
    const wrapper = mount(MyDialog);
    expect(wrapper.vm.$options.name).toBe('MyDialog');
  });
});