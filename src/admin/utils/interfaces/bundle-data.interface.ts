export interface IDataBundle {
    iccid:      string;
    matchingId: string;
    rspUrl:     string;
    bundle:     string;
    reference:  string;
    bundles:    Bundle[];
}

export interface Bundle {
    name:        string;
    description: string;
    assignments: Assignment[];
}

export interface Assignment {
    id:                  string;
    callTypeGroup:       string;
    initialQuantity:     number;
    remainingQuantity:   number;
    assignmentDateTime:  Date;
    assignmentReference: string;
    bundleState:         keyof BundlesStateEsim;
    unlimited:           boolean;
}

export interface BundlesStateEsim {
    processing: string;
    queued:     string; 
    active:     string; 
    depleted:   string; 
    expired:    string; 
    revoked:    string;
}