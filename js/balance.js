// Balance storage and drawer
const balanceKey = 'smartshop_balance';
const balancePill = document.getElementById('balance');
const balanceDrawer = document.getElementById('balance-drawer');
const balanceBackdrop = document.getElementById('balance-backdrop');
const balanceClose = document.getElementById('balance-close');
const balanceAmount = document.getElementById('balance-amount');
const balanceMessage = document.getElementById('balance-message');
const addMoneyBtn = document.getElementById('add-money-btn');

function readBalanceStorage() {
  try {
    return localStorage.getItem(balanceKey);
  } catch {
    return null;
  }
}

function writeBalanceStorage(value) {
  try {
    localStorage.setItem(balanceKey, value);
  } catch {}
}

function getBalance() {
  const stored = Number(readBalanceStorage());
  return Number.isFinite(stored) && stored >= 0 ? stored : START_BALANCE;
}

function setBalance(amount) {
  writeBalanceStorage(String(amount));
  renderBalance();
}

function renderBalance() {
  const text = `৳${getBalance().toLocaleString('en-US')}`;
  balancePill.textContent = text;
  balanceAmount.textContent = text;
}

function showBalanceMessage(message, tone) {
  balanceMessage.className = `mt-3 text-xs ${tone === 'success' ? 'text-emerald-600' : 'text-rose-500'}`;
  balanceMessage.textContent = message;
}

function addMoney(amount) {
  setBalance(getBalance() + amount);
  showBalanceMessage(`৳${amount.toLocaleString('en-US')} added to your balance.`, 'success');
}

// Drawer open/close
function openBalanceDrawer() {
  balanceDrawer.classList.remove('translate-x-full');
  balanceBackdrop.classList.remove('opacity-0', 'pointer-events-none');
  balanceMessage.className = 'hidden';
  balanceMessage.textContent = '';
}

function closeBalanceDrawer() {
  balanceDrawer.classList.add('translate-x-full');
  balanceBackdrop.classList.add('opacity-0', 'pointer-events-none');
}

balancePill.addEventListener('click', () => {
  if (balanceDrawer.classList.contains('translate-x-full')) openBalanceDrawer();
  else closeBalanceDrawer();
});

balanceClose.addEventListener('click', closeBalanceDrawer);
balanceBackdrop.addEventListener('click', closeBalanceDrawer);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeBalanceDrawer();
});

addMoneyBtn.addEventListener('click', () => addMoney(1000));
// End Drawer open/close

if (readBalanceStorage() === null) setBalance(START_BALANCE);
else renderBalance();
// End Balance storage and drawer
