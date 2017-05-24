import { ChatClientPage } from './app.po';

describe('chat-client App', () => {
  let page: ChatClientPage;

  beforeEach(() => {
    page = new ChatClientPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
