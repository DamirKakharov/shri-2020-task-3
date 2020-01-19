export enum RuleKeys {
    UppercaseNamesIsForbidden = "uppercaseNamesIsForbidden",
    BlockNameIsRequired = "blockNameIsRequired",
    WarningTextSizesShouldBeEqual = "warningTextSizesShouldBeEqual",
}

export enum Severity {
    Error = "Error",
    Warning = "Warning",
    Information = "Information",
    Hint = "Hint",
    None = "None"
}

export interface SeverityConfiguration {
    [RuleKeys.BlockNameIsRequired]: Severity;
    [RuleKeys.UppercaseNamesIsForbidden]: Severity;
    [RuleKeys.WarningTextSizesShouldBeEqual]: Severity;
}

export interface ExampleConfiguration {

    enable: boolean;

    severity: SeverityConfiguration;
}
