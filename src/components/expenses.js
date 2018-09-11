import React, { Component } from 'react';
import Close from './close';
import Edit from './edit';
import CurrencyInput, { sanitizeAmount } from './currency-input';
import { get, post, del, put } from './fetcher';
import dashToCamel from '../helpers/dashToCamel';

class Expenses extends Component {
  constructor() {
    super();
    this.state = {
      expensesFetched: false,
      expenses: [],
      sortName: 0,
      sortAmount: 0,
      sorts: ['desc', 'asc'],
      income: 0,
      ...this.cleanState()
    };

    this.toggleAddModal = this.toggleAddModal.bind(this);
    this.toggleDeleteModal = this.toggleDeleteModal.bind(this);
    this.toggleEditModal = this.toggleEditModal.bind(this);
    this.keyup = this.keyup.bind(this);
    this.inputExpense = this.inputExpense.bind(this);
    this.submitExpense = this.submitExpense.bind(this);
    this.deleteExpense = this.deleteExpense.bind(this);
    this.sort = this.sort.bind(this);
    this.changeIncome = this.changeIncome.bind(this);
    this.submitIncome = this.submitIncome.bind(this);
    this.toFixed = this.toFixed.bind(this);
  }

  // Fetch all the expenses into state.
  // Add 'esc' & 'enter' key listeners for modals.
  componentDidMount() {
    // Avoid ajax calls in `componentWillMount` - https://goo.gl/TpkCvx
    Promise.all([get('/api/expenses'), get('/api/income')])
      .then(data => {
        const [expenses, income] = data
        this.setState(prevState => ({
          expenses,
          expensesFetched: true,
          income: income ? income.amount : prevState.income
        }));
      })
      .catch(err => {
        this.setState({ expensesFetched: true });
        console.log('FETCH DATA ERROR:', err);
      });

    window.addEventListener('keyup', this.keyup);
  }

  // Remove 'esc' & 'enter' key listener for modals.
  componentWillUnmount() {
    window.removeEventListener('keyup', this.modalEscKey);
  }

  // Returns an object cleaning up certain parts of the state.
  cleanState() {
    return {
      addModalShowing: false,
      deleteModalShowing: false,
      editModalShowing: false,
      deleteId: '',
      editId: '',
      addExpenseName: '',
      addExpenseAmount: '',
      editExpenseName: '',
      editExpenseAmount: ''
    };
  }

  // Show / hide the 'add expense' modal.
  toggleAddModal() {
    const closing = !!this.state.addModalShowing;

    this.setState(prevState => ({
      addModalShowing: !closing,
      addExpenseName: closing ? '' : prevState.addExpenseName,
      addExpenseAmount: closing ? '' : prevState.addExpenseAmount
    }));
  }

  // Show / hide 'delete expense' modal.
  toggleDeleteModal(e) {
    const id = e ? e.currentTarget.dataset.id : '';

    this.setState(prevState => ({
      deleteModalShowing: !prevState.deleteModalShowing,
      deleteId: id
    }));
  }

  // Show / hide 'edit expense' modal.
  toggleEditModal(e) {
    const id = e ? e.currentTarget.dataset.id : '';
    const expense = this.state.expenses.find(exp => exp._id === id) || {};

    this.setState(prevState => ({
      editModalShowing: !prevState.editModalShowing,
      editId: id,
      editExpenseName: expense.name || '',
      editExpenseAmount: expense.amount || ''
    }));
  }

  // Esc & enter key event listener function.
  keyup(e) {
    const { which, target } = e;
    if (which === 27) this.setState(this.cleanState());
    if (which === 13) {
      const { edit, add } = target.dataset;
      if (!edit && !add) return;
      this.submitExpense(e);
    }
  }

  // Updates the modal input fields (both add & edit).
  inputExpense(e) {
    const { id, value } = e.target;
    const name = dashToCamel(id);

    name && this.setState({ [name]: this.toFixed(value) });
  }

  // Save expense to the db.
  submitExpense(e) {
    const type = !!e.target.dataset.edit ? 'edit' : 'add';
    const name = this.state[type + 'ExpenseName'];
    let amount = +sanitizeAmount(this.state[type + 'ExpenseAmount']);
    let url = '/api/expense';

    if (type === 'edit') url += `/${this.state.editId}`
    if (!name || !amount) return;

    const body = { name, amount };
    (type === 'add' ? post : put)(url, body)
      .then(res => {
        const { _id } = res;
        const { expenses } = this.state;

        if (type === 'add') {
          expenses.unshift(res);
        } else {
          const updated = expenses.find(exp => exp._id === _id);
          updated.name = name;
          updated.amount = amount;
        }

        this.setState({ ...this.cleanState(), expenses })
      })
      .catch(error => {
        this.setState({ ...this.cleanState() });
        console.log('SUBMIT EXPENSE ERROR:', { error, body });
      });
  }

  // Delete expense from the db.
  deleteExpense() {
    const { deleteId, expenses } = this.state;
    const newState = {
      ...this.cleanState(),
      expenses: expenses.filter(exp => exp._id !== deleteId)
    };

    del(`/api/expense/${deleteId}`)
      .then(res => this.setState({ ...newState }))
      .catch(error => {
        const expense = this.state.expenses.find(exp => exp.id === deleteId);
        this.setState(this.cleanState());
        console.log('DELETE ERROR:', { error, expense, deleteId });
      });
  }

  // 'Add expense' modal markup.
  renderAddModal() {
    return (
      <div
        className='expense-modal fixed top-0 left-0 pa4'
        onKeyUp={this.modalEscKey}>
        <Close
          size='2em'
          className='absolute top-0 right-0 pa3'
          onClick={this.toggleAddModal} />
        <div className='flex flex-column items-center justify-center w-100 h-100'>
          <div>
            <div className='inputs flex f3'>
              <input
                autoFocus
                data-add
                id='add-expense-name'
                className='tc mh5 w-50'
                type='text'
                value={this.state.addExpenseName}
                onChange={this.inputExpense} />
              <CurrencyInput
                data-add
                id='add-expense-amount'
                className='tc mh5 w-50'
                onChange={this.inputExpense} />
            </div>
            <div className='labels flex'>
              <div className='mh5 mt1 w-50 tc'>Name of the expense</div>
              <div className='mh5 mt1 w-50 tc'>Amount, such as "$312.45"</div>
            </div>
            <button data-add className='center db mt3' onClick={this.submitExpense}>SUBMIT</button>
          </div>
        </div>
      </div>
    );
  }

  // 'Delete expense' modal markup.
  renderDeleteModal() {
    const flexClasses = 'flex justify-center items-center flex-column';
    const { deleteId, expenses} = this.state;
    const expense = expenses.find(exp => exp._id === deleteId);
    const { name, amount } = expense;

    return (
      <div className={`expense-modal fixed top-0 left-0 pa4 ${flexClasses}`}>
        <h2>Are you sure you want to delete this expense?</h2>
        <h4 className='mt0'>{name} &mdash; ${amount}</h4>
        <div className='flex'>
          <button className='delete-button mr2' onClick={this.deleteExpense} autoFocus>OK</button>
          <button className='delete-button ml2' onClick={this.toggleDeleteModal}>Cancel</button>
        </div>
      </div>
    );
  }

  // 'Edit expense' modal markup.
  renderEditModal() {
    const { editId, editExpenseName, editExpenseAmount } = this.state;

    return (
      <div
        className='expense-modal fixed top-0 left-0 pa4'
        onKeyUp={this.modalEscKey}>
        <Close
          size='2em'
          className='absolute top-0 right-0 pa3'
          onClick={this.toggleEditModal} />
        <div className='flex flex-column items-center justify-center w-100 h-100'>
          <div>
            <div className='inputs flex f3'>
              <input
                autoFocus
                data-edit
                id='edit-expense-name'
                className='tc mh5 w-50'
                type='text'
                value={editExpenseName}
                onChange={this.inputExpense} />
              <CurrencyInput
                data-edit
                id='edit-expense-amount'
                className='tc mh5 w-50'
                initialValue={this.state.editExpenseAmount}
                onChange={this.inputExpense} />
            </div>
            <div className='labels flex'>
              <div className='mh5 mt1 w-50 tc'>Name of the expense</div>
              <div className='mh5 mt1 w-50 tc'>Amount, such as "$312.45"</div>
            </div>
            <button data-edit className='center db mt3' onClick={this.submitExpense}>SUBMIT</button>
          </div>
        </div>
      </div>
    );
  }

  // Expense rows.
  renderExpenses() {
    let className = 'expense flex bl bt br';
    const { expenses } = this.state;
    const last = expenses.length - 1;

    return this.state.expenses.map((expense, i) => {
      const { name, amount, _id: id } = expense;

      if (i === last) className += ' bb';

      return (
        <div className={className} key={i}>
          <div className='flex-grow-1 pa3'>{name}</div>
          <div className='w-10-ns pa3 tr bl'>${this.toFixed(amount)}</div>
          <div className='flex-grow-0 pa3 bl flex items-center justify-center'>
            <Edit data-id={id} onClick={this.toggleEditModal} />
          </div>
          <div className='flex-grow-0 pa3 bl flex items-center justify-center'>
            <Close data-id={id} onClick={this.toggleDeleteModal} />
          </div>
        </div>
      );
    });
  }

  toFixed(val) {
    return +val % 1 ? (+val).toFixed(2) : val
  }

  // Renders the total at the bottom of the table.
  renderTotal() {
    const { expenses, income } = this.state;
    const total = (expenses || []).reduce((acc, exp) => (acc + +exp.amount), 0);
    const remaining = income - total
    return  (
      <div className='mt3'>
        <div>Total Expenses: ${this.toFixed(total)}</div>
        <div>Budget Remaining: ${this.toFixed(remaining)}</div>
      </div>
    );
  }

  // Sort's by name or amount.
  sort(e) {
    const type = e.target.dataset.type;
    const typeCap = type[0].toUpperCase() + type.slice(1);

    let num = this.state['sort' + typeCap] + 1;
    if (num === this.state.sorts.length) num = 0;

    const dir = this.state.sorts[num]; // 'asc' or 'desc'

    function sortByName(a, b) {
      if (a.name > b.name) return dir === 'asc' ? 1 : -1;
      if (a.name < b.name) return dir === 'asc' ? -1 : 1;
      return 0
    }

    this.setState(({ expenses }) => ({
      ['sort' + typeCap]: num,
      expenses: expenses.sort((a, b) => {
        if (type === 'name') {
          return sortByName(a, b)
        } else if (type === 'amount') {
          if (+a.amount > +b.amount) return dir === 'asc' ? 1 : -1;
          if (+a.amount < +b.amount) return dir === 'asc' ? -1 : 1;
          return sortByName(a, b)
        }
      }),
    }));
  }

  changeIncome(e) {
    this.setState({ income: e.target.value });
  }

  // Save income to the db.
  submitIncome(e) {
    if (e.key !== 'Enter' && e.key !== 'Escape') return;

    let income = this.state.income.replace(/ /g, '').match(/[.0-9]/g) || '';
    this.input.blur();

    if (e.key === 'Escape') return this.input.value = this.state.income;
    if (income !== '') income = +income.join('');
    put('/api/income', { amount: income })
      .then(() => this.setState({ income }));
  }

  render() {
    const {
      expenses,
      expensesFetched,
      addModalShowing,
      deleteModalShowing,
      editModalShowing,
      income
    } = this.state;

    return (
      <div className='ph4 pb4'>
        <h1>Monthly Expenses</h1>
        <div className='flex items-baseline mb3'>
          <h3 className='ma0'>Income:</h3>
          <span className='ml2 f4'>$</span>
          <input
            id='income'
            className='f4'
            value={this.toFixed(+income)}
            ref={el => this.input = el}
            onChange={this.changeIncome}
            onKeyUp={this.submitIncome} />
        </div>
        <div className='buttons'>
          <button className='pointer' onClick={this.toggleAddModal}>Add Expense</button>
          <button data-type='name' className='pointer ml2' onClick={this.sort}>Sort by name</button>
          <button data-type='amount' className='pointer ml2' onClick={this.sort}>Sort by Amount</button>
        </div>
        <div className='expenses mt3'>
          { !expensesFetched && 'Loading...' }
          { expenses.length ? this.renderExpenses() : '' }
          { (expensesFetched && !expenses.length) ? 'No expenses yet.' : '' }
        </div>
        { this.renderTotal() }
        { addModalShowing && this.renderAddModal() }
        { deleteModalShowing && this.renderDeleteModal() }
        { editModalShowing && this.renderEditModal() }
      </div>
    );
  }
}

export default Expenses;
