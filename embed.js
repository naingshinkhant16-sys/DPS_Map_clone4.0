const jfAgentCacheName = 'dynamic-agent-v1';

const sanitizeVariables = (url, width, height) => {
  try {
    const sanitizedUrl = new URL(url);
    const url = sanitizedUrl.toString();
    const width = parseInt(width);
    const height = parseInt(height);
    return { url, width, height };
  } catch (e) {
    console.error('Error sanitizing variables', e);
    return { url: '', width: 0, height: 0 };
  }
};

const handlePictureInPictureRequest = async event => {
  if (event.data.type !== 'jf-request-pip-window') {
    return;
  }
  const { _url, _width, _height } = event.data;
  const { url, width, height } = sanitizeVariables(_url, _width, _height);
  if (url === '' || width === 0 || height === 0) {
    return;
  }
  if ('documentPictureInPicture' in window) {
    // return if already in picture in picture mode
    if (window.documentPictureInPicture.window) {
      return;
    }
    const pipWindow = await window.documentPictureInPicture.requestWindow({
      width,
      height,
      disallowReturnToOpener: true
    });
    // copy styles from main window to pip window
    [...document.styleSheets].forEach(styleSheet => {
      try {
        const cssRules = [...styleSheet.cssRules]
          .map(rule => rule.cssText)
          .join('');
        const style = document.createElement('style');
        style.textContent = cssRules;
        pipWindow.document.head.appendChild(style);
      } catch (e) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = styleSheet.type;
        link.media = styleSheet.media;
        link.href = styleSheet.href;
        pipWindow.document.head.appendChild(link);
      }
    });
    pipWindow.document.body.innerHTML = `<iframe src="${url}" style="width: ${width}px; height: ${height}px;" allow="microphone *; display-capture *;"></iframe>`;
    return { success: true, isActive: false };
  }
};

window.addEventListener('message', handlePictureInPictureRequest);

(async () => {
  const src = "https://www.jotform.com/s/umd/23d401b3aab/for-embedded-agent.js";
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  script.onload = function() {
    window.AgentInitializer.init({
      agentRenderURL: "https://www.jotform.com/agent/0199c6f613b77f338047183e31c049c2e1cc",
      rootId: "JotformAgent-0199c6f613b77f338047183e31c049c2e1cc",
      formID: "0199c6f613b77f338047183e31c049c2e1cc",
      contextID: "019e1c92a76a78f1affde31eb43742de9cf3",
      initialContext: "",
      queryParams: ["skipWelcome=1","maximizable=1"],
      domain: "https://www.jotform.com",
      isDraggable: false,
      background: "linear-gradient(180deg, #0F53B4 0%, #0F53B4 100%)",
      chatBackgroundColor: "#FFFFFF",
      buttonBackgroundColor: "#246506",
      buttonIconColor: "#FFFFFF",
      inputTextColor: "#06367E",
      variant: false,
      customizations: {"greeting":"Yes","greetingMessage":"\u1019\u1004\u103a\u1039\u1002\u101c\u102c\u1015\u102b\u104b \u1000\u103b\u103d\u1014\u103a\u1010\u1031\u102c\u103a\/\u1000\u103b\u103d\u1014\u103a\u1019\u1018\u101a\u103a\u101c\u102d\u102f\u1000\u1030\u100a\u102e\u101b\u1019\u101c\u1032\u104b","openByDefault":"No","pulse":"Yes","position":"right","autoOpenChatIn":"0","layout":"minimal"},
      isVoice: false,
      isVoiceWebCallEnabled: true
    });
  };
  document.head.appendChild(script);
})();
