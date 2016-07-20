defmodule Docs.DocumentController do
  use Docs.Web, :controller

  def show(conn, %{"id" => name} = _params) do
    # text(conn, "Showing document #{name}")
    render conn, "show.html", name: name
  end
end
