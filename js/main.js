// ---- before/after sliders ----
document.querySelectorAll('.ba').forEach(function(ba){
  const range = ba.querySelector('input[type=range]');
  function set(v){
    v = Math.max(0, Math.min(100, v));
    ba.style.setProperty('--pos', v + '%');
    if (range.value != v) range.value = v;
  }
  range.addEventListener('input', () => set(parseFloat(range.value)));
  ba.addEventListener('pointerdown', function(e){
    const rect = ba.getBoundingClientRect();
    const move = ev => set(((ev.clientX - rect.left) / rect.width) * 100);
    move(e);
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  });
});

// intro sweep on the first slider so visitors notice
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  const first = document.querySelector('.ba');
  if (first){
    let done = false;
    const io = new IntersectionObserver(en => {
      if (en[0].isIntersecting && !done){
        done = true; io.disconnect();
        const t0 = performance.now();
        (function sweep(t){
          const p = Math.min(1, (t - t0) / 1200);
          const e = 1 - Math.pow(1 - p, 3);
          first.style.setProperty('--pos', (20 + e * 40) + '%');
          first.querySelector('input').value = 20 + e * 40;
          if (p < 1) requestAnimationFrame(sweep);
        })(t0);
      }
    }, {threshold:.6});
    io.observe(first);
  }
}

// ---- Web3Forms submit ----
const form = document.getElementById('quoteForm');
const msg = document.getElementById('formMsg');
const btn = document.getElementById('q-btn');
const phoneField = document.getElementById('q-phone');
const emailField = document.getElementById('q-email');

function isRealPhoneNumber(value){
  const digits = value.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 11) return false;
  const core = digits.length === 11 ? digits.slice(1) : digits;
  if (digits.length === 11 && digits[0] !== '1') return false;
  if (/^(\d)\1{9}$/.test(core)) return false;
  if (core === '1234567890' || core === '0123456789') return false;
  return true;
}

function isRealEmail(value){
  return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(value);
}

form.addEventListener('submit', async function(e){
  e.preventDefault();

  phoneField.setCustomValidity('');
  emailField.setCustomValidity('');

  if (!isRealPhoneNumber(phoneField.value)){
    phoneField.setCustomValidity('Enter a real phone number, like (406) 414-6472.');
    phoneField.reportValidity();
    return;
  }
  if (!isRealEmail(emailField.value)){
    emailField.setCustomValidity('Enter a real email address, like name@example.com.');
    emailField.reportValidity();
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Sending…';
  msg.className = 'form-msg';
  try{
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: new FormData(form),
      headers: {'Accept': 'application/json'}
    });
    const data = await res.json();
    if (data.success){
      msg.textContent = "Got it. Your request is in. We'll get back to you shortly, usually the same day.";
      msg.classList.add('ok');
      form.reset();
    } else {
      throw new Error(data.message || 'Submission failed');
    }
  } catch(err){
    msg.textContent = "Something went wrong sending the form. Please call or text (406) 414-6472 instead.";
    msg.classList.add('err');
  }
  btn.disabled = false;
  btn.textContent = 'Request My Free Estimate';
});
