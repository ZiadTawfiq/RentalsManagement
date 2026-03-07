CREATE TABLE [AspNetRoles] (
    [Id] nvarchar(450) NOT NULL,
    [Name] nvarchar(256) NULL,
    [NormalizedName] nvarchar(256) NULL,
    [ConcurrencyStamp] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetRoles] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [Assets] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(100) NOT NULL,
    [Description] nvarchar(max) NULL,
    [Quantity] int NOT NULL,
    [LastUpdated] datetime2 NOT NULL,
    CONSTRAINT [PK_Assets] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [Campains] (
    [Id] int NOT NULL IDENTITY,
    [Type] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Campains] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [ExternalAccounts] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(100) NOT NULL,
    [Description] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_ExternalAccounts] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [FinancialAccounts] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(450) NOT NULL,
    [accountType] int NOT NULL,
    [Balance] decimal(18,2) NOT NULL,
    CONSTRAINT [PK_FinancialAccounts] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [Owners] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    [PhoneNumber] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_Owners] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [Properties] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_Properties] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [SystemSettings] (
    [Id] int NOT NULL IDENTITY,
    [CampaignDiscountPercentage] decimal(18,2) NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_SystemSettings] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [AspNetRoleClaims] (
    [Id] int NOT NULL IDENTITY,
    [RoleId] nvarchar(450) NOT NULL,
    [ClaimType] nvarchar(max) NULL,
    [ClaimValue] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetRoleClaims] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [AspNetUsers] (
    [Id] nvarchar(450) NOT NULL,
    [PropertyId] int NULL,
    [UserName] nvarchar(256) NULL,
    [NormalizedUserName] nvarchar(256) NULL,
    [Email] nvarchar(256) NULL,
    [NormalizedEmail] nvarchar(256) NULL,
    [EmailConfirmed] bit NOT NULL,
    [PasswordHash] nvarchar(max) NULL,
    [SecurityStamp] nvarchar(max) NULL,
    [ConcurrencyStamp] nvarchar(max) NULL,
    [PhoneNumber] nvarchar(max) NULL,
    [PhoneNumberConfirmed] bit NOT NULL,
    [TwoFactorEnabled] bit NOT NULL,
    [LockoutEnd] datetimeoffset NULL,
    [LockoutEnabled] bit NOT NULL,
    [AccessFailedCount] int NOT NULL,
    CONSTRAINT [PK_AspNetUsers] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AspNetUsers_Properties_PropertyId] FOREIGN KEY ([PropertyId]) REFERENCES [Properties] ([Id]) ON DELETE NO ACTION
);
GO


CREATE TABLE [Units] (
    [Id] int NOT NULL IDENTITY,
    [Code] nvarchar(450) NOT NULL,
    [OwnerId] int NOT NULL,
    [PropertyId] int NOT NULL,
    CONSTRAINT [PK_Units] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Units_Owners_OwnerId] FOREIGN KEY ([OwnerId]) REFERENCES [Owners] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Units_Properties_PropertyId] FOREIGN KEY ([PropertyId]) REFERENCES [Properties] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [AspNetUserClaims] (
    [Id] int NOT NULL IDENTITY,
    [UserId] nvarchar(450) NOT NULL,
    [ClaimType] nvarchar(max) NULL,
    [ClaimValue] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetUserClaims] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AspNetUserClaims_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [AspNetUserLogins] (
    [LoginProvider] nvarchar(450) NOT NULL,
    [ProviderKey] nvarchar(450) NOT NULL,
    [ProviderDisplayName] nvarchar(max) NULL,
    [UserId] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_AspNetUserLogins] PRIMARY KEY ([LoginProvider], [ProviderKey]),
    CONSTRAINT [FK_AspNetUserLogins_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [AspNetUserRoles] (
    [UserId] nvarchar(450) NOT NULL,
    [RoleId] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_AspNetUserRoles] PRIMARY KEY ([UserId], [RoleId]),
    CONSTRAINT [FK_AspNetUserRoles_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_AspNetUserRoles_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [AspNetUserTokens] (
    [UserId] nvarchar(450) NOT NULL,
    [LoginProvider] nvarchar(450) NOT NULL,
    [Name] nvarchar(450) NOT NULL,
    [Value] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetUserTokens] PRIMARY KEY ([UserId], [LoginProvider], [Name]),
    CONSTRAINT [FK_AspNetUserTokens_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [AssetTransactions] (
    [Id] int NOT NULL IDENTITY,
    [AssetId] int NOT NULL,
    [QuantityChanged] int NOT NULL,
    [Type] int NOT NULL,
    [Description] nvarchar(max) NULL,
    [Date] datetime2 NOT NULL,
    [PerformedById] nvarchar(450) NULL,
    CONSTRAINT [PK_AssetTransactions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AssetTransactions_AspNetUsers_PerformedById] FOREIGN KEY ([PerformedById]) REFERENCES [AspNetUsers] ([Id]),
    CONSTRAINT [FK_AssetTransactions_Assets_AssetId] FOREIGN KEY ([AssetId]) REFERENCES [Assets] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [EmployeeFinancialAccounts] (
    [Id] int NOT NULL IDENTITY,
    [UserId] nvarchar(450) NOT NULL,
    [SalaryForCurrentMonth] decimal(18,2) NOT NULL,
    [BaseMonthlySalary] decimal(18,2) NOT NULL,
    [RemainingMonthlySalary] decimal(18,2) NOT NULL,
    [CommissionBalance] decimal(18,2) NOT NULL,
    [RemainingCommission] decimal(18,2) NOT NULL,
    [TotalBonusBalance] decimal(18,2) NOT NULL,
    [RemainingBonusBalance] decimal(18,2) NOT NULL,
    [LoanBalance] decimal(18,2) NOT NULL,
    [LastUpdated] datetime2 NOT NULL,
    CONSTRAINT [PK_EmployeeFinancialAccounts] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_EmployeeFinancialAccounts_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE NO ACTION
);
GO


CREATE TABLE [ExternalTransactions] (
    [Id] int NOT NULL IDENTITY,
    [ExternalAccountId] int NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [Currency] nvarchar(10) NOT NULL,
    [Type] nvarchar(20) NOT NULL,
    [Description] nvarchar(max) NULL,
    [Date] datetime2 NOT NULL,
    [ProofImagePath] nvarchar(max) NULL,
    [PerformedById] nvarchar(450) NULL,
    CONSTRAINT [PK_ExternalTransactions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ExternalTransactions_AspNetUsers_PerformedById] FOREIGN KEY ([PerformedById]) REFERENCES [AspNetUsers] ([Id]),
    CONSTRAINT [FK_ExternalTransactions_ExternalAccounts_ExternalAccountId] FOREIGN KEY ([ExternalAccountId]) REFERENCES [ExternalAccounts] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [RefreshTokens] (
    [Id] int NOT NULL IDENTITY,
    [Token] nvarchar(max) NOT NULL,
    [ExpiresOn] datetime2 NOT NULL,
    [IsRevoked] bit NOT NULL,
    [UserId] nvarchar(450) NOT NULL,
    [CreatedOn] datetime2 NOT NULL,
    [RevokedOn] datetime2 NOT NULL,
    CONSTRAINT [PK_RefreshTokens] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_RefreshTokens_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [Rentals] (
    [Id] int NOT NULL IDENTITY,
    [StartDate] date NOT NULL,
    [EndDate] date NOT NULL,
    [CheckoutDate] date NULL,
    [DayPriceCustomer] decimal(18,2) NOT NULL,
    [DayPriceOwner] decimal(18,2) NOT NULL,
    [CustomerDeposit] decimal(18,2) NOT NULL,
    [OwnerDeposit] decimal(18,2) NULL,
    [holder] int NULL,
    [SecurityDeposit] decimal(18,2) NULL,
    [HasCampaignDiscount] bit NOT NULL,
    [CustomerFullName] nvarchar(max) NULL,
    [CustomerPhoneNumber] nvarchar(max) NOT NULL,
    [PropertyId] int NOT NULL,
    [OwnerId] int NOT NULL,
    [UnitId] int NOT NULL,
    [ReservationTime] datetime2 NOT NULL,
    [status] int NOT NULL,
    [CancellationReason] nvarchar(max) NULL,
    [campainId] int NULL,
    [CreatedByEmployeeId] nvarchar(450) NULL,
    CONSTRAINT [PK_Rentals] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Rentals_AspNetUsers_CreatedByEmployeeId] FOREIGN KEY ([CreatedByEmployeeId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE SET NULL,
    CONSTRAINT [FK_Rentals_Campains_campainId] FOREIGN KEY ([campainId]) REFERENCES [Campains] ([Id]),
    CONSTRAINT [FK_Rentals_Owners_OwnerId] FOREIGN KEY ([OwnerId]) REFERENCES [Owners] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Rentals_Properties_PropertyId] FOREIGN KEY ([PropertyId]) REFERENCES [Properties] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Rentals_Units_UnitId] FOREIGN KEY ([UnitId]) REFERENCES [Units] ([Id]) ON DELETE NO ACTION
);
GO


CREATE TABLE [EarningsHistories] (
    [Id] int NOT NULL IDENTITY,
    [EmployeeFinancialAccountId] int NOT NULL,
    [Category] int NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [Description] nvarchar(max) NULL,
    [Time] datetime2 NOT NULL,
    [PerformedById] nvarchar(450) NULL,
    CONSTRAINT [PK_EarningsHistories] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_EarningsHistories_AspNetUsers_PerformedById] FOREIGN KEY ([PerformedById]) REFERENCES [AspNetUsers] ([Id]) ON DELETE SET NULL,
    CONSTRAINT [FK_EarningsHistories_EmployeeFinancialAccounts_EmployeeFinancialAccountId] FOREIGN KEY ([EmployeeFinancialAccountId]) REFERENCES [EmployeeFinancialAccounts] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [EmployeeTransactions] (
    [Id] int NOT NULL IDENTITY,
    [EmployeeFinancialAccountId] int NOT NULL,
    [FinancialAccountId] int NULL,
    [Category] int NOT NULL,
    [Type] int NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [Description] nvarchar(max) NULL,
    [Time] datetime2 NOT NULL,
    [PerformedById] nvarchar(450) NULL,
    CONSTRAINT [PK_EmployeeTransactions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_EmployeeTransactions_AspNetUsers_PerformedById] FOREIGN KEY ([PerformedById]) REFERENCES [AspNetUsers] ([Id]) ON DELETE SET NULL,
    CONSTRAINT [FK_EmployeeTransactions_EmployeeFinancialAccounts_EmployeeFinancialAccountId] FOREIGN KEY ([EmployeeFinancialAccountId]) REFERENCES [EmployeeFinancialAccounts] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_EmployeeTransactions_FinancialAccounts_FinancialAccountId] FOREIGN KEY ([FinancialAccountId]) REFERENCES [FinancialAccounts] ([Id])
);
GO


CREATE TABLE [FinancialTransactions] (
    [Id] int NOT NULL IDENTITY,
    [FinancialAccountId] int NOT NULL,
    [TransactionType] int NOT NULL,
    [Description] nvarchar(max) NULL,
    [RentalId] int NULL,
    [Notes] nvarchar(max) NULL,
    [Amount] decimal(18,2) NOT NULL,
    [Time] datetime2 NOT NULL,
    [DepositHolder] nvarchar(max) NULL,
    CONSTRAINT [PK_FinancialTransactions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_FinancialTransactions_FinancialAccounts_FinancialAccountId] FOREIGN KEY ([FinancialAccountId]) REFERENCES [FinancialAccounts] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_FinancialTransactions_Rentals_RentalId] FOREIGN KEY ([RentalId]) REFERENCES [Rentals] ([Id])
);
GO


CREATE TABLE [RentalNotes] (
    [Id] int NOT NULL IDENTITY,
    [RentalId] int NOT NULL,
    [Content] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [AddedByEmployeeId] nvarchar(450) NULL,
    CONSTRAINT [PK_RentalNotes] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_RentalNotes_AspNetUsers_AddedByEmployeeId] FOREIGN KEY ([AddedByEmployeeId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE SET NULL,
    CONSTRAINT [FK_RentalNotes_Rentals_RentalId] FOREIGN KEY ([RentalId]) REFERENCES [Rentals] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [RentalSales] (
    [RentalId] int NOT NULL,
    [SalesRepresentativeId] nvarchar(450) NOT NULL,
    [CommissionPercentage] decimal(18,2) NOT NULL,
    [CommissionAmount] decimal(18,2) NOT NULL,
    CONSTRAINT [PK_RentalSales] PRIMARY KEY ([RentalId], [SalesRepresentativeId]),
    CONSTRAINT [FK_RentalSales_AspNetUsers_SalesRepresentativeId] FOREIGN KEY ([SalesRepresentativeId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_RentalSales_Rentals_RentalId] FOREIGN KEY ([RentalId]) REFERENCES [Rentals] ([Id]) ON DELETE NO ACTION
);
GO


CREATE TABLE [RentalSettlements] (
    [Id] int NOT NULL IDENTITY,
    [RentalId] int NOT NULL,
    [TotalCustomerAmount] decimal(18,2) NOT NULL,
    [PaidByCustomer] decimal(18,2) NOT NULL,
    [CustomerOutstanding] decimal(18,2) NOT NULL,
    [OwnerTotalAmount] decimal(18,2) NOT NULL,
    [OwnerPaid] decimal(18,2) NOT NULL,
    [OwnerRemaining] decimal(18,2) NOT NULL,
    [SalesCommission] decimal(18,2) NULL,
    [CalculatedAt] datetime2 NOT NULL,
    [CampainMoney] decimal(18,2) NULL,
    CONSTRAINT [PK_RentalSettlements] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_RentalSettlements_Rentals_RentalId] FOREIGN KEY ([RentalId]) REFERENCES [Rentals] ([Id]) ON DELETE NO ACTION
);
GO


CREATE INDEX [IX_AspNetRoleClaims_RoleId] ON [AspNetRoleClaims] ([RoleId]);
GO


CREATE UNIQUE INDEX [RoleNameIndex] ON [AspNetRoles] ([NormalizedName]) WHERE [NormalizedName] IS NOT NULL;
GO


CREATE INDEX [IX_AspNetUserClaims_UserId] ON [AspNetUserClaims] ([UserId]);
GO


CREATE INDEX [IX_AspNetUserLogins_UserId] ON [AspNetUserLogins] ([UserId]);
GO


CREATE INDEX [IX_AspNetUserRoles_RoleId] ON [AspNetUserRoles] ([RoleId]);
GO


CREATE INDEX [EmailIndex] ON [AspNetUsers] ([NormalizedEmail]);
GO


CREATE INDEX [IX_AspNetUsers_PropertyId] ON [AspNetUsers] ([PropertyId]);
GO


CREATE UNIQUE INDEX [IX_AspNetUsers_UserName] ON [AspNetUsers] ([UserName]) WHERE [UserName] IS NOT NULL;
GO


CREATE UNIQUE INDEX [UserNameIndex] ON [AspNetUsers] ([NormalizedUserName]) WHERE [NormalizedUserName] IS NOT NULL;
GO


CREATE INDEX [IX_AssetTransactions_AssetId] ON [AssetTransactions] ([AssetId]);
GO


CREATE INDEX [IX_AssetTransactions_PerformedById] ON [AssetTransactions] ([PerformedById]);
GO


CREATE INDEX [IX_EarningsHistories_EmployeeFinancialAccountId] ON [EarningsHistories] ([EmployeeFinancialAccountId]);
GO


CREATE INDEX [IX_EarningsHistories_PerformedById] ON [EarningsHistories] ([PerformedById]);
GO


CREATE INDEX [IX_EmployeeFinancialAccounts_UserId] ON [EmployeeFinancialAccounts] ([UserId]);
GO


CREATE INDEX [IX_EmployeeTransactions_EmployeeFinancialAccountId] ON [EmployeeTransactions] ([EmployeeFinancialAccountId]);
GO


CREATE INDEX [IX_EmployeeTransactions_FinancialAccountId] ON [EmployeeTransactions] ([FinancialAccountId]);
GO


CREATE INDEX [IX_EmployeeTransactions_PerformedById] ON [EmployeeTransactions] ([PerformedById]);
GO


CREATE INDEX [IX_ExternalTransactions_ExternalAccountId] ON [ExternalTransactions] ([ExternalAccountId]);
GO


CREATE INDEX [IX_ExternalTransactions_PerformedById] ON [ExternalTransactions] ([PerformedById]);
GO


CREATE UNIQUE INDEX [IX_FinancialAccounts_Name] ON [FinancialAccounts] ([Name]);
GO


CREATE INDEX [IX_FinancialTransactions_FinancialAccountId] ON [FinancialTransactions] ([FinancialAccountId]);
GO


CREATE INDEX [IX_FinancialTransactions_RentalId] ON [FinancialTransactions] ([RentalId]);
GO


CREATE UNIQUE INDEX [IX_Owners_PhoneNumber] ON [Owners] ([PhoneNumber]);
GO


CREATE UNIQUE INDEX [IX_Properties_Name] ON [Properties] ([Name]);
GO


CREATE INDEX [IX_RefreshTokens_UserId] ON [RefreshTokens] ([UserId]);
GO


CREATE INDEX [IX_RentalNotes_AddedByEmployeeId] ON [RentalNotes] ([AddedByEmployeeId]);
GO


CREATE INDEX [IX_RentalNotes_RentalId] ON [RentalNotes] ([RentalId]);
GO


CREATE INDEX [IX_Rentals_campainId] ON [Rentals] ([campainId]);
GO


CREATE INDEX [IX_Rentals_CreatedByEmployeeId] ON [Rentals] ([CreatedByEmployeeId]);
GO


CREATE INDEX [IX_Rentals_OwnerId] ON [Rentals] ([OwnerId]);
GO


CREATE INDEX [IX_Rentals_PropertyId] ON [Rentals] ([PropertyId]);
GO


CREATE INDEX [IX_Rentals_UnitId] ON [Rentals] ([UnitId]);
GO


CREATE INDEX [IX_RentalSales_SalesRepresentativeId] ON [RentalSales] ([SalesRepresentativeId]);
GO


CREATE UNIQUE INDEX [IX_RentalSettlements_RentalId] ON [RentalSettlements] ([RentalId]);
GO


CREATE UNIQUE INDEX [IX_Units_Code] ON [Units] ([Code]);
GO


CREATE INDEX [IX_Units_OwnerId] ON [Units] ([OwnerId]);
GO


CREATE INDEX [IX_Units_PropertyId] ON [Units] ([PropertyId]);
GO


