(() => {
  'use strict';
  const form = document.querySelector('form[data-email-verification="true"]');
  if (!form) return;
  const en = document.documentElement.lang === 'en';
  const text = (cs, english) => en ? english : cs;
  const email = form.elements.email, code = form.elements.code;
  const group = document.getElementById('emailVerification');
  const status = document.getElementById('verificationStatus');
  const resend = document.getElementById('resendCode');
  const submit = form.querySelector('button[type="submit"]');
  const caption = submit.querySelector('span');
  const captcha = document.getElementById('contactChallenge');
  let challenge = '', verifiedAddress = '', busy = false, widget, captchaReady, lastRequest = 0;
  let generation = 0;
  const errors = {
    email: text('Zkontroluj e-mailovou adresu.', 'Check your email address.'),
    code: text('Kód nesouhlasí. Zkus ho zadat znovu.', 'The code does not match. Please try again.'),
    expired: text('Kód už vypršel. Vyžádej si nový.', 'This code has expired. Request a new one.'),
    attempts: text('Počet pokusů je vyčerpaný. Vyžádej si nový kód.', 'Too many attempts. Request a new code.'),
    limit: text('Dosáhli jsme limitu odesílání. Zkus to později nebo mi napiš přímo e-mailem.', 'The sending limit has been reached. Try later or email me directly.'),
    challenge: text('Dokonči prosím kontrolu proti spamu a zkus to znovu.', 'Please complete the spam check and try again.'),
    size: text('Přílohy mohou mít dohromady nejvýš 10 MB a nejvýš 10 souborů.', 'Attach no more than 10 files, totalling up to 10 MB.'),
    file: text('Některá příloha nemá podporovaný formát.', 'An attachment has an unsupported format.'),
    changed: text('Údaje se během odesílání změnily. Vyžádej si nový kód.', 'The details changed during sending. Request a new code.'),
    invalid: text('Zkontroluj vyplněné údaje a přílohy.', 'Check your details and attachments.'),
    delivery: text('Odeslání se nepodařilo potvrdit. Zkus stejnou poptávku odeslat znovu.', 'Sending could not be confirmed. Try submitting the same enquiry again.'),
    unavailable: text('Ověření teď není dostupné. Zkus to později nebo mi napiš přímo e-mailem.', 'Verification is currently unavailable. Try later or email me directly.')
  };
  function say(message) { status.textContent = message; }
  function label() { caption.textContent = challenge ? text('Ověřit a odeslat poptávku', 'Verify and send enquiry') : text('Odeslat ověřovací kód', 'Send verification code'); }
  function reset() {
    generation++; challenge = ''; verifiedAddress = ''; code.value = ''; code.required = false; code.disabled = true;
    group.hidden = true; label();
  }
  email.addEventListener('input', () => { reset(); say(''); });
  async function api(path, body) {
    const response = await fetch(new URL(path, form.action), {
      method:'POST', mode:'cors', credentials:'omit',
      headers: body instanceof FormData ? {} : {'Content-Type':'application/json'},
      body:body instanceof FormData ? body : JSON.stringify(body), signal:AbortSignal.timeout(45000)
    });
    let result; try { result = await response.json(); } catch { throw new Error('unavailable'); }
    if (!response.ok) throw new Error(result.error || 'unavailable');
    return result;
  }
  function turnstileToken() {
    if (!captchaReady) captchaReady = new Promise((resolve,reject) => {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true; script.onload = resolve; script.onerror = () => reject(new Error('challenge'));
      document.head.appendChild(script);
    }).catch(error => { captchaReady = null; throw error; });
    return captchaReady.then(() => new Promise((resolve,reject) => {
      captcha.hidden = false;
      if (widget !== undefined) window.turnstile.remove(widget);
      const timeout = setTimeout(() => reject(new Error('challenge')), 120000);
      widget = window.turnstile.render(captcha, {
        sitekey: form.dataset.turnstileSitekey, action:'contact-email', theme:'dark', language:en?'en':'cs',
        callback: token => { clearTimeout(timeout); resolve(token); },
        'error-callback': () => { clearTimeout(timeout); reject(new Error('challenge')); },
        'expired-callback': () => { clearTimeout(timeout); reject(new Error('challenge')); }
      });
    }));
  }
  async function requestCode() {
    if (Date.now() - lastRequest < 60000) {
      say(text('Před dalším kódem počkej jednu minutu.', 'Wait one minute before requesting another code.')); return;
    }
    const address = email.value.trim(), current = generation;
    say(text('Připravuji ověřovací e-mail…', 'Preparing your verification email…'));
    const token = await turnstileToken();
    if (current !== generation) return;
    const result = await api('/request-code',{email:address, language:en?'en':'cs', turnstile:token, honey:form.elements._honey.value});
    lastRequest = Date.now();
    if (current !== generation) return;
    if (!result.challenge) throw new Error('unavailable');
    challenge = result.challenge; verifiedAddress = address;
    group.hidden = false; code.disabled = false; code.required = true; code.value = ''; label();
    captcha.hidden = true;
    say(text('Kód jsme odeslali na ', 'We sent a code to ') + address + text('. Platí 10 minut. Zkontroluj i spam.', '. It is valid for 10 minutes. Check your spam folder too.'));
    code.focus();
  }
  async function run(action) {
    if (busy) return;
    busy = true; submit.disabled = true; resend.disabled = true; form.setAttribute('aria-busy','true');
    try { await action(); }
    catch (e) { say(errors[e.message] || errors.unavailable); }
    finally { busy=false; submit.disabled=false; resend.disabled=false; form.removeAttribute('aria-busy'); }
  }
  resend.addEventListener('click', () => {
    if (email.reportValidity()) run(requestCode);
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const files=[...form.elements.attachment.files];
    if (files.length>10 || files.reduce((sum,f)=>sum+f.size,0)>10*1024*1024) { say(errors.size); return; }
    if (!challenge || email.value.trim() !== verifiedAddress) { reset(); run(requestCode); return; }
    run(async () => {
      say(text('Ověřuji kód a odesílám poptávku…', 'Verifying the code and sending your enquiry…'));
      const data=new FormData(form); data.set('challenge',challenge); data.set('email',verifiedAddress);
      const result=await api('/submit',data);
      if (!result.ok) throw new Error('delivery');
      window.dispatchEvent(new CustomEvent('stats:event',{detail:{name:'form_submit',data:{sluzba:form.elements['Služba'].value}}}));
      location.assign(en ? '/thanks-en.html' : '/dekuji.html');
    });
  });
  reset();
})();
