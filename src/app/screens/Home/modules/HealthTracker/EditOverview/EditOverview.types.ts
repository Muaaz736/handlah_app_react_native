export interface EditOverviewFormData {
    bloodType: string;
    keyDiagnosis: string;
    allergies: string;
    recentSurgeries: string;
    endDate: string;
    dateofbirth: string;
}

export interface EditOverviewProps {
    onEditOverview?: (data: EditOverviewFormData) => void;
}

export interface EditOverviewRouteParams {
    childId?: number;
    overview?: {
        name?: string;
        bloodType?: string;
        keyDiagnosis?: string;
        allergies?: string;
        recentSurgeries?: string;
        endDate?: string;
        dateofbirth?: string;
        isMyself?: boolean;
    };
}
