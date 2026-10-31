/* Design-only interactions for the mock store (no backend) */
(function () {
  const faDigits = "۰۱۲۳۴۵۶۷۸۹";
  const toFa = (n) => String(n).replace(/\d/g, (d) => faDigits[d]);
  const toEn = (s) =>
    String(s)
      .replace(/[۰-۹]/g, (d) => String(faDigits.indexOf(d)))
      .replace(/[٬,]/g, "");
  const fmt = (n) =>
    toFa(String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "٬"));

  /* ---------- cart badge ---------- */
  const badges = document.querySelectorAll("[data-cart-count]");
  const getCount = () => (badges[0] && parseInt(toEn(badges[0].textContent), 10)) || 0;
  const setCount = (n) => badges.forEach((b) => (b.textContent = toFa(n)));

  document.querySelectorAll("[data-add-cart]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setCount(getCount() + 1);
      const old = btn.textContent;
      btn.textContent = "افزوده شد ✓";
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = old;
        btn.disabled = false;
      }, 1400);
    });
  });

  /* ---------- product gallery ---------- */
  const mainImage = document.querySelector("[data-main-image]");
  document.querySelectorAll("[data-thumb]").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      if (mainImage) mainImage.src = thumb.getAttribute("data-thumb");
      document
        .querySelectorAll("[data-thumb]")
        .forEach((t) => t.classList.remove("ring-2", "ring-brand-500"));
      thumb.classList.add("ring-2", "ring-brand-500");
    });
  });

  /* ---------- option chips (size / color) ---------- */
  document.querySelectorAll("[data-option-group]").forEach((group) => {
    group.querySelectorAll("[data-option]").forEach((opt) => {
      opt.addEventListener("click", () => {
        group
          .querySelectorAll("[data-option]")
          .forEach((o) =>
            o.classList.remove("border-brand-500", "bg-brand-50", "font-bold")
          );
        opt.classList.add("border-brand-500", "bg-brand-50", "font-bold");
        const out = group.querySelector("[data-option-label]");
        if (out) out.textContent = opt.getAttribute("data-option");
      });
    });
  });

  /* ---------- quantity steppers ---------- */
  document.querySelectorAll("[data-qty]").forEach((wrap) => {
    const input = wrap.querySelector("input");
    const update = () => {
      const row = wrap.closest("[data-cart-row]");
      const price = row && row.getAttribute("data-price");
      const total = row && row.querySelector("[data-row-total]");
      if (price && total) {
        const val = (parseInt(toEn(input.value), 10) || 1) * parseInt(price, 10);
        total.innerHTML = fmt(val) + ' <span class="text-[11px] text-muted">تومان</span>';
      }
      updateSummary();
    };
    wrap.querySelector("[data-minus]").addEventListener("click", () => {
      input.value = Math.max(1, (parseInt(toEn(input.value), 10) || 1) - 1);
      update();
    });
    wrap.querySelector("[data-plus]").addEventListener("click", () => {
      input.value = Math.min(20, (parseInt(toEn(input.value), 10) || 1) + 1);
      update();
    });
    input.addEventListener("change", update);
  });

  /* ---------- cart remove + totals ---------- */
  function updateSummary() {
    const rows = document.querySelectorAll("[data-cart-row]");
    if (!rows.length) return;
    let sum = 0;
    rows.forEach((row) => {
      const price = parseInt(row.getAttribute("data-price"), 10) || 0;
      const qty =
        parseInt(toEn(row.querySelector("[data-qty] input").value), 10) || 1;
      sum += price * qty;
    });
    const discount = Math.round(sum * 0.1);
    const shipping = sum >= 500000 ? 0 : 49000;
    const set = (sel, val) => {
      const el = document.querySelector(sel);
      if (el) el.textContent = fmt(val) + " تومان";
    };
    set("[data-sum]", sum);
    set("[data-discount]", -discount);
    set("[data-payable]", sum - discount + shipping);
    const shipEl = document.querySelector("[data-shipping-note]");
    if (shipEl) shipEl.textContent = shipping === 0 ? "رایگان" : fmt(shipping) + " تومان";
  }

  document.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = btn.closest("[data-cart-row]");
      if (row) row.remove();
      updateSummary();
      const empty = document.querySelector("[data-cart-empty]");
      const body = document.querySelector("[data-cart-body]");
      if (empty && body && !document.querySelector("[data-cart-row]")) {
        body.classList.add("hidden");
        empty.classList.remove("hidden");
      }
    });
  });

  updateSummary();

  /* ---------- header search toggle (mobile) ---------- */
  const mobileSearch = document.querySelector("[data-mobile-search]");
  const searchField = document.querySelector("[data-search-field]");
  if (mobileSearch && searchField) {
    mobileSearch.addEventListener("click", () => {
      searchField.classList.toggle("hidden");
      searchField.classList.toggle("md:block");
      searchField.focus();
    });
  }
})();
