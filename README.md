# perfaderp

This app processes CPU Profiles generated with the webkit CPU profiler. You can generate them in Chromium based browsers with Dev Tools -> Kabob Menu -> More Tools -> JavaScript profiler.

## Sources

### Listen for new S3 objects via SQS

A bucket is setup so new objects send notifications to an SQS queue. This app listens on the SQS queue.

### Manually download S3 bucket

`S3_BUCKET={bucket} node tools/importS3.js` manually imports all CPU profiles from the bucket, up to 1000 (fixme).


# Deployment

- First setup an S3 bucket with the CPU profiles and have it notify to SQS.
- Syntax: `https://bucket.s3.amazonaws.com/brave/browser-laptop/15234--a1b2c3d4e5d6/{category}--{test case}--{user profile}-2017-09-28T23%3A39%3A49.451Z.cpuprofile`
- Runs in Docker on Linux or MacOS.
- Clone the repo then create an `env.node` Docker env file. Minimally it should have `NODE_ENV` and `SQS_ENDPOINT_CPU_PROFILES`; it also needs `AWS_ACCESS_KEY_ID` and `AWS_ACCESS_KEY_ID` if not using an IAM instance role.
- `docker-compose up -d` to start.
- Go to http://{hostname}:3000 to view grafana, the influxdb interface. Default password is admin/admin. Data source is influxdb at `http://{hostname}:8086`, connect directly (no proxy). Then create a dashboards.
