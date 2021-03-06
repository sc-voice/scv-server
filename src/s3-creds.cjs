(function (exports) {
  const fs = require("fs");
  const path = require("path");
  const { logger } = require("log-instance");
  const { GuidStore } = require("memo-again");
  const { AwsConfig, SayAgain } = require("say-again");
  const LOCAL = path.join(__dirname, "../local");
  const AWS_CREDS_PATH = path.join(LOCAL, "aws-creds.json");

  class S3Creds {
    constructor(opts = {}) {
      var configPath = opts.configPath || AWS_CREDS_PATH;
      var awsCreds = fs.existsSync(configPath)
        ? JSON.parse(fs.readFileSync(configPath))
        : {};

      var config = opts.awsConfig || new AwsConfig(awsCreds);
      this.awsConfig = config;
      let s3 = (config.s3 = config.s3 || {});
      let polly = (config.polly = config.polly || {});
      let sayAgain = (config.sayAgain = config.sayAgain || {});

      config.region = config.region || 
        polly.region || s3.region || "us-west-1";

      config.secretAccessKey = config.secretAccessKey || 
        polly.secretAccessKey || s3.secretAccessKey;

      config.accessKeyId = config.accessKeyId || 
        polly.accessKeyId || s3.accessKeyId;

      config.Bucket = config.Bucket || awsCreds.Bucket || "sc-voice-vsm";
      sayAgain.Bucket = "say-again.sc-voice";
    }

    async write() {
    }

    obfuscate(s) {
      if (s == null) {
        return "(n/a)";
      }
      var result = "";
      for (var i = 0; i < s.length; i++) {
        result = result + (i < s.length - 4 ? "*" : s[i]);
      }
      return result;
    }

    obfuscated() {
      var s3 = Object.assign({}, this.awsConfig.s3);
      var polly = Object.assign({}, this.awsConfig.polly);
      if (s3) {
        s3.secretAccessKey = this.obfuscate(s3.secretAccessKey);
        s3.accessKeyId = this.obfuscate(s3.accessKeyId);
      }
      if (polly) {
        polly.secretAccessKey = this.obfuscate(polly.secretAccessKey);
        polly.accessKeyId = this.obfuscate(polly.accessKeyId);
      }
      return {
        Bucket: this.awsConfig.Bucket,
        s3,
        polly,
      };
    }
  }

  module.exports = exports.S3Creds = S3Creds;
})(typeof exports === "object" ? exports : (exports = {}));
