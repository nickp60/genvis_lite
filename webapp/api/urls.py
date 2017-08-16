from django.conf.urls import url
import api.views


urlpatterns = [
    url(r'^series/detail', api.views.series_detail, name="api_series_detail"),
    url(r'^series/find', api.views.series_find, name="api_series_find"),
    url(r'^timeseries', api.views.time_series, name="api_time_series"),
]
