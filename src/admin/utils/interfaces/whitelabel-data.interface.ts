export interface IResellerWhitelabelData {
    id: string;
    navbar?: IResellerWhitelabelNavbar | null;
    footer?: IResellerWhitelabelFooter | null;
    company?: IResellerWhitelabelCompany | null;
    reseller_user_id?: string | null;
    terms_and_conditions?: string | null;
    privacy_policy?: string | null;
    home_heading_section?: IResellerWhitelabelHome;
    home_sections?: IResellerWhitelabelHomeSection[];
    created_at: string;
    updated_at: string;
}
  
export interface IResellerWhitelabelNavbar {
    logo_url?: string;
    contact_url: string;
    about_url?: string;
    is_login_enabled: boolean;
}

export interface IResellerWhitelabelFooter {
    logo_url: string;
    term_and_conditions_url: string;
    privacy_policy_url: string;
}

export interface IResellerWhitelabelCompany {
    name: string;
    primary_color: string;
    secondary_color: string;
}

export interface IResellerWhitelabelHome {
    background_image_url?: string;
    main_heading: string;
    main_description: string;
    main_get_esim: string;
}
  
export interface IResellerWhitelabelHomeSection {
    heading: string;
    description: string;
    image_url?: string;
}

export interface ISaveDataWhiteLabel extends Omit<IResellerWhitelabelData, 'id' | 'reseller_user_id' | 'created_at' | 'updated_at'>{}

export interface IDataFormInfoGeneral extends IResellerWhitelabelCompany, Omit<IResellerWhitelabelNavbar, 'logo_url' | 'about_url'>{}

export interface IDataFormInfoHome extends Omit<IResellerWhitelabelHome, 'background_image_url'>{}

export interface IDataFormSectionHome extends IResellerWhitelabelHomeSection{
    image?: File
}