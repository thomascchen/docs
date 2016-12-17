defmodule Docs.DocumentChannel do
  use Docs.Web, :channel

  def join("documents:" <> doc_id, _params, socket) do
    socket = assign(socket, :doc_id, doc_id)
    messages = Repo.all(from m in Message,
                        where: m.document_id == ^doc_id,
                        order_by: [desc: m.inserted_at],
                        select: %{id: m.id, body: m.body},
                        limit: 100
    ) |> Enum.reverse()

    {:ok, %{"messages": messages}, socket}
  end

  def handle_in("text_change", %{"delta" => delta}, socket) do
    broadcast_from! socket, "text_change", %{delta: delta}
    {:reply, :ok, socket}
  end

  def handle_in("new_msg", %{"body" => body} = params, socket) do
    doc = Repo.get!(Document, socket.assigns.doc_id)
    changeset =
      doc
      |> Ecto.build_assoc(:messages)
      |> Message.changeset(params)

    case Repo.insert(changeset) do
      {:ok, _message} ->
        broadcast! socket, "new_msg", %{body: body}
        {:reply, :ok, socket}
      {:error, changeset} ->
        {:reply, {:error, %{errors: []}}, socket}
    end

    {:reply, :ok, socket}
  end
end
