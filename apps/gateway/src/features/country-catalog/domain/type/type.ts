export type PullCountryWithCityResponseType = {
  error: boolean;
  msg: string;
  data: PullCountryWithCityType[];
};

export type PullCountryWithCityType = {
  iso2: string;
  iso3: string;
  country: string;
  cities: string[];
};
