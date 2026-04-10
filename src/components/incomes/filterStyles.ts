export const filterLabelStyles = {
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.16em",
  color: "#94a3b8",
  marginBottom: 6
}

export const filterPlainLabelStyles = {
  fontSize: "14px",
  fontWeight: 600,
  color: "#0f172a",
  marginBottom: 8
}

export const filterInputStyles = {
  height: 44,
  borderRadius: 18,
  borderColor: "#dbe4f0",
  background: "#ffffff",
  color: "#334155",
  fontSize: 14,
  fontWeight: 500,
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.02)"
}

export const filterDropdownStyles = {
  borderRadius: 18,
  border: "1px solid #dbe4f0",
  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)"
}

export const filterSegmentedStyles = {
  root: {
    padding: 4,
    borderRadius: 16,
    background: "#f8fafc",
    border: "1px solid #dbe4f0"
  },
  indicator: {
    borderRadius: 12,
    background: "#ffffff",
    border: "1px solid #dbe4f0",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)"
  },
  label: {
    minHeight: 38,
    padding: "8px 20px",
    fontSize: 14,
    fontWeight: 700,
    color: "#475569",
    "&[dataActive='true']": {
      color: "#0f172a",
      fontWeight: 800
    }
  }
}

export const filterCheckboxContainerStyles = {
  minHeight: 44,
  display: "flex",
  alignItems: "center",
  borderRadius: 18,
  border: "1px solid #dbe4f0",
  background: "#f8fafc",
  padding: "10px 16px",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.02)"
}

export const filterCheckboxStyles = {
  body: {
    alignItems: "center"
  },
  labelWrapper: {
    display: "flex",
    alignItems: "center"
  },
  label: {
    paddingLeft: 10,
    fontSize: 14,
    fontWeight: 500,
    color: "#334155"
  },
  input: {
    borderColor: "#cbd5e1",
    background: "#ffffff"
  }
}
