document.addEventListener("DOMContentLoaded", function() {
    var status_field;
    var url_box;
    var select_box;
    var select_radio;
    var custom_radio;

    function init_options() {
        status_field = document.getElementById("status");
        url_box = document.getElementById("base_url_box");
        select_box = document.getElementById("base_url_select");
        select_radio = document.getElementById("url_select");
        custom_radio = document.getElementById("url_custom");
        save_button = document.getElementById("save_button");

        select_radio.addEventListener("click", radio_onclick);
        custom_radio.addEventListener("click", radio_onclick);
        select_box.addEventListener("change", select_onchange);
        save_button.addEventListener("click", save_options);

        update_url_select();
        restore_options();
    }

    function save_options() {
        chrome.storage.sync.set({"base_url": url_box.value}, function() {
            // Update status to let user know options were saved.
            status_field.innerHTML = "Options Saved.";
            setTimeout(function() {
                status_field.innerHTML = "";
            }, 2000);
        });
    }

    function restore_options() {
        chrome.storage.sync.get({"base_url": null}, function(items) {
            var base_url = items["base_url"];

            if (base_url) {
                url_box.value = base_url;
                select_box.value = base_url;
                if (select_box.value == base_url) {
                    select_radio.checked = true;
                } else {
                    custom_radio.checked = true;
                }
            } else {
                select_radio.checked = true;
                select_box.selectedIndex = 0;
            }
            radio_onclick();
            select_onchange();
        });
    }

    function select_onchange() {
        if (select_radio.checked) {
            url_box.value = select_box.value;
        }
    }

    function radio_onclick() {
        select_box.disabled = !select_radio.checked;
        url_box.disabled = select_radio.checked;
    }

    function update_url_select() {
        var req = new XMLHttpRequest();
        req.open("GET",
                "https://ezproxy-db.appspot.com/proxies.json", false);
        req.onreadystatechange = function(event) {
            if (req.readyState != 4 || req.status != 200) {
                return;
            }
            var response = JSON.parse(req.responseText);
            if (response.length > 0) {
                for (var i = select_box.length - 1; i >= 0; i--) {
                    select_box.remove(i);
                }
                for (var i in response) {
                    var proxy = response[i];
                    var option = document.createElement("option");
                    option.text = proxy.name;
                    option.value = proxy.url;
                    select_box.add(option, null);
                }
            }
        }
        req.send();
    }

    init_options();
});
