import { config } from "../../torli.config";

export function getTerminology() {
  return config.terminology;
}

export function getDefaultBookingFields() {
  return config.bookingFields;
}

export function getBusinessConfig() {
  return config;
}
