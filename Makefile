image_name=newrelic/fastly-to-insights

require_tag:
	@if [ -z "$(tag)" ]; then echo "tag must be set" && exit 1; fi
	@if [ "$(tag)" != "$(shell git describe --tags --exact-match)" ]; then echo "please checkout requested tag: $(tag)" && exit 1; fi

release: require_tag
	docker buildx build --platform linux/amd64,linux/arm64 --push -t $(image_name):$(tag) .

build:
	docker buildx build --platform linux/amd64,linux/arm64 -t $(image_name) .

run: build
	docker run --rm --env-file .env --name fastly-to-insights $(image_name)
