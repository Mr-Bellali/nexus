export const ErrorCodes = {
    NotFound: 'not_found',
    AlreadyUsed: 'already_used',
  
    // Accounts
    InvalidJWT: 'invalid_jwt',
    BadAuth: 'bad_auth',
    AccountAlreadyExists: 'account_already_exists',
    AccountAlreadyLinkedWithEmployee: 'account_already_linked_with_employee',
    AccountNotActive: 'account_not_active',
    EmployeeAlreadyWithAnotherCompany: 'employee_already_with_another_company',
    AccountNotAssignedACategory: 'account_not_assigned_a_category',
    NoContractSelected: 'no_contract_selected',
    DeactivatedContract: 'deactivated_contract',
    ContractNotFound: 'contract_not_found',
    FamilyMemberNotFound: 'family_member_not_found',
  
    // Finance
    NotEnoughBalance: 'not_enough_balance',
    DailyLimitReached: 'daily_limit_reached',
    CashbackLimitReached: 'cashback_limit_reached',
  
    // Companies
    SiretAlreadyUsed: 'siret_already_used',
    StandardCategoryMissing: 'standard_category_missing',
    PaymentMethodMissing: 'payment_method_missing',
  
    // Categories
    CategoryAlreadyExists: 'category_already_exists',
    CategoryNotActive: 'category_not_active',
  
    // Expenses
    ExpenseDateInTheFuture: 'expense_date_in_the_future',
    ExpenseDateOutsideContractDates: 'expense_date_outside_contract_dates',
    ExpenseDateOlderThan2Months: 'expense_date_older_than_2_months',
    ExpenseStatusNotAllowed: 'expense_status_not_allowed',
  
    // Documents
    InvalidDocument: 'invalid_document',
    DocumentTooLarge: 'document_too_large',
  
    // Generic
    Unauthorized: 'unauthorized',
    InvalidAPICall: 'invalid_api_call',
    InvalidPhoneNumber: 'invalid_phone_number',
    VerificationFailed: 'verification_failed',
    InternalServerError: 'internal_server_error',
  
    // Notifications
    SMSFailure: 'sms_failure',
  
    // Dates
    InconsistentDates: 'inconsistent_dates',
  } as const;