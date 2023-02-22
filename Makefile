image_name=newrelic/fastly-to-insights

build:
	docker build -t $(image_name) .

run: build
	docker run --rm --env-file .env --name fastly-to-insights $(image_name)
