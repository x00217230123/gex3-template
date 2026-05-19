const { createApp } = Vue;

createApp({
  data() {
    return {
      form: {
        fullName: "",
        dateOfBirth: "",
        gender: "",
        totalVisitors: "",
        totalChildren: "",
        accommodation: "",
        cardholderName: "",
        cardNumber: "",
        expirationDate: "",
        cvv: ""
      },
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
      let valid = true;
      const nextErrors = {};

      if (!this.form.fullName.trim()) {
        nextErrors.fullName = "Full name is required.";
        valid = false;
      }
      if (!this.form.dateOfBirth) {
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
      if (!this.form.expirationDate) {
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
