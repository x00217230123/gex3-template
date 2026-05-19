const { createApp } = Vue;

const ENGLISH_MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" }
];

function daysInMonth(month, year) {
  const m = Number(month);
  const y = Number(year);
  if (!m || !y) return 31;
  return new Date(y, m, 0).getDate();
}

function buildYearRange(start, end) {
  const years = [];
  for (let y = end; y >= start; y -= 1) {
    years.push(y);
  }
  return years;
}

const currentYear = new Date().getFullYear();

createApp({
  data() {
    return {
      form: {
        fullName: "",
        dateOfBirth: "",
        dobMonth: "",
        dobDay: "",
        dobYear: "",
        gender: "",
        totalVisitors: "",
        totalChildren: "",
        accommodation: "",
        cardholderName: "",
        cardNumber: "",
        expirationDate: "",
        expMonth: "",
        expYear: "",
        cvv: ""
      },
      englishMonths: ENGLISH_MONTHS,
      birthYears: buildYearRange(1920, currentYear),
      expirationYears: buildYearRange(currentYear, currentYear + 15),
      errors: {},
      generalError: "",
      places: [],
      isLoadingPlaces: false,
      placesError: "",
      selectedPlaces: [],
      accommodationOptions: [
        "No accommodation needed",
        "Forest View Hotel",
        "Totoro Family Inn",
        "Witch Valley Guesthouse",
        "Luxury Ghibli Resort"
      ],
      showSummary: false
    };
  },
  computed: {
    cardLastFour() {
      const digits = String(this.form.cardNumber).replace(/\D/g, "");
      return digits.slice(-4) || "----";
    },
    dobDayOptions() {
      const max = daysInMonth(this.form.dobMonth, this.form.dobYear);
      return Array.from({ length: max }, (_, i) => i + 1);
    }
  },
  mounted() {
    this.loadPlaces();
  },
  methods: {
    async loadPlaces() {
      this.isLoadingPlaces = true;
      this.placesError = "";
      try {
        const response = await fetch("ghibli_park.json");
        if (!response.ok) {
          throw new Error("Could not load places data.");
        }
        this.places = await response.json();
      } catch (error) {
        this.placesError = error.message || "Failed to load Ghibli Park places.";
        this.places = [];
      } finally {
        this.isLoadingPlaces = false;
      }
    },
    onDobChange() {
      const max = daysInMonth(this.form.dobMonth, this.form.dobYear);
      if (this.form.dobDay && Number(this.form.dobDay) > max) {
        this.form.dobDay = String(max);
      }
      this.syncDateOfBirth();
    },
    syncDateOfBirth() {
      const { dobMonth, dobDay, dobYear } = this.form;
      if (dobMonth && dobDay && dobYear) {
        this.form.dateOfBirth = `${dobYear}-${dobMonth}-${String(dobDay).padStart(2, "0")}`;
      } else {
        this.form.dateOfBirth = "";
      }
    },
    onExpirationChange() {
      const { expMonth, expYear } = this.form;
      if (expMonth && expYear) {
        this.form.expirationDate = `${expYear}-${expMonth}`;
      } else {
        this.form.expirationDate = "";
      }
    },
    isPlaceSelected(placeId) {
      return this.selectedPlaces.some((place) => place.id === placeId);
    },
    formatDateEnglish(isoDate) {
      if (!isoDate) return "";
      const parts = isoDate.split("-").map(Number);
      if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
        return isoDate;
      }
      const [year, month, day] = parts;
      return new Date(year, month - 1, day).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    },
    formatMonthEnglish(isoMonth) {
      if (!isoMonth) return "";
      const parts = isoMonth.split("-").map(Number);
      if (parts.length !== 2 || parts.some((n) => Number.isNaN(n))) {
        return isoMonth;
      }
      const [year, month] = parts;
      return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long"
      });
    },
    togglePlace(place) {
      const index = this.selectedPlaces.findIndex((item) => item.id === place.id);
      if (index >= 0) {
        this.selectedPlaces.splice(index, 1);
      } else {
        this.selectedPlaces.push(place);
      }
    },
    clearErrors() {
      this.errors = {};
      this.generalError = "";
    },
    validateForm() {
      this.syncDateOfBirth();
      this.onExpirationChange();

      let valid = true;
      const nextErrors = {};

      if (!this.form.fullName.trim()) {
        nextErrors.fullName = "Full name is required.";
        valid = false;
      }
      if (!this.form.dobMonth || !this.form.dobDay || !this.form.dobYear) {
        nextErrors.dateOfBirth = "Date of birth is required.";
        valid = false;
      }
      if (!this.form.gender) {
        nextErrors.gender = "Please select a gender.";
        valid = false;
      }
      if (this.selectedPlaces.length === 0) {
        nextErrors.places = "Please select at least one place.";
        valid = false;
      }
      if (!this.form.totalVisitors && this.form.totalVisitors !== 0) {
        nextErrors.totalVisitors = "Total visitors is required.";
        valid = false;
      } else if (Number(this.form.totalVisitors) < 1) {
        nextErrors.totalVisitors = "Total visitors must be at least 1.";
        valid = false;
      }
      if (this.form.totalChildren === "" || this.form.totalChildren === null) {
        nextErrors.totalChildren = "Number of children is required.";
        valid = false;
      } else if (Number(this.form.totalChildren) < 0) {
        nextErrors.totalChildren = "Number of children cannot be negative.";
        valid = false;
      } else if (Number(this.form.totalChildren) > Number(this.form.totalVisitors)) {
        nextErrors.totalChildren = "Children cannot exceed total visitors.";
        valid = false;
      }
      if (!this.form.accommodation) {
        nextErrors.accommodation = "Please select an accommodation option.";
        valid = false;
      }
      if (!this.form.cardholderName.trim()) {
        nextErrors.cardholderName = "Cardholder name is required.";
        valid = false;
      }
      if (!this.form.cardNumber.trim()) {
        nextErrors.cardNumber = "Card number is required.";
        valid = false;
      }
      if (!this.form.expMonth || !this.form.expYear) {
        nextErrors.expirationDate = "Expiration date is required.";
        valid = false;
      }
      if (!this.form.cvv.trim()) {
        nextErrors.cvv = "CVV is required.";
        valid = false;
      }

      this.errors = nextErrors;
      return valid;
    },
    generateItinerary() {
      this.clearErrors();
      this.showSummary = false;

      const valid = this.validateForm();
      if (!valid) {
        this.generalError =
          "There are mandatory items pending to be filled. Please complete the required fields.";
        return;
      }

      this.showSummary = true;
    }
  }
}).mount("#app");
