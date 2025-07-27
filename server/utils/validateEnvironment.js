const dotenv = require("dotenv");
dotenv.config();

/**
 * Validates required environment variables for production deployment
 * Helps catch configuration issues early
 */
const validateEnvironment = () => {
  const requiredVars = [
    "JWT_KEY",
    "CLIENT_URL",
  ];

  const productionVars = [
    "COOKIE_DOMAIN",
    "CLIENT_URL_PRODUCTION",
  ];

  const missingVars = [];
  const warnings = [];

  // Check required variables
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  // Check production-specific variables
  if (process.env.NODE_ENV === "production") {
    productionVars.forEach(varName => {
      if (!process.env[varName]) {
        warnings.push(`Production variable ${varName} is not set`);
      }
    });
  }

  // Validate JWT_KEY strength
  if (process.env.JWT_KEY && process.env.JWT_KEY.length < 32) {
    warnings.push("JWT_KEY should be at least 32 characters long for security");
  }

  // Validate CLIENT_URL format
  if (process.env.CLIENT_URL && !process.env.CLIENT_URL.startsWith("http")) {
    warnings.push("CLIENT_URL should start with http:// or https://");
  }

  // Log results
  if (missingVars.length > 0) {
    console.error("❌ Missing required environment variables:");
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn("⚠️  Environment warnings:");
    warnings.forEach(warning => {
      console.warn(`   - ${warning}`);
    });
  }

  console.log("✅ Environment validation passed");
  
  // Log current configuration (without sensitive data)
  console.log("📋 Current configuration:");
  console.log(`   - NODE_ENV: ${process.env.NODE_ENV || "development"}`);
  console.log(`   - CLIENT_URL: ${process.env.CLIENT_URL || "not set"}`);
  console.log(`   - COOKIE_DOMAIN: ${process.env.COOKIE_DOMAIN || "not set"}`);
  console.log(`   - JWT_KEY: ${process.env.JWT_KEY ? "✅ set" : "❌ not set"}`);
};

module.exports = validateEnvironment;
