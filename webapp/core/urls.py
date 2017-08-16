"""core URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import include, url
from django.contrib import admin
from django.views.static import serve
import api.urls
import genvis.urls
from core import settings
import pathlib

WEBCOMPONENTS_UNBUNDLED_DIR = settings.BASE_DIR + "/../webcomponents/build/unbundled"
WEBCOMPONENTS_DEFAULT_DIR = settings.BASE_DIR + "/../webcomponents/build/default"

if pathlib.Path(WEBCOMPONENTS_UNBUNDLED_DIR).exists():
    POLYMER_DIR = WEBCOMPONENTS_UNBUNDLED_DIR
elif pathlib.Path(WEBCOMPONENTS_DEFAULT_DIR).exists():
    POLYMER_DIR = WEBCOMPONENTS_DEFAULT_DIR
else:
    raise Exception("Cannot find polymer dir")

print("Using Polymer dir: {}".format(POLYMER_DIR))

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^api/', include(api.urls)),
    url(r'^genvis/', include(genvis.urls)),
    url(r'^(?P<path>.*)$', serve, {'document_root': POLYMER_DIR,})
]
