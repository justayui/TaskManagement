package com.taskmanagement.backend.service;

import com.taskmanagement.backend.dto.CardResponse;
import com.taskmanagement.backend.dto.CreateCardRequest;
import com.taskmanagement.backend.entity.Card;
import com.taskmanagement.backend.entity.TaskList;
import com.taskmanagement.backend.repository.CardRepository;
import com.taskmanagement.backend.repository.TaskListRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class CardService {

    private final CardRepository cardRepository;
    private final TaskListRepository taskListRepository;

    public CardService(CardRepository cardRepository, TaskListRepository taskListRepository) {
        this.cardRepository = cardRepository;
        this.taskListRepository = taskListRepository;
    }

    public List<CardResponse> getAllCards() {
        return cardRepository.findAll().stream()
                .map(CardResponse::from)
                .toList();
    }

    public CardResponse getCardById(UUID id) {
        Card card = cardRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found: " + id));
        return CardResponse.from(card);
    }

    public List<CardResponse> getCardsByListId(UUID listId) {
        return cardRepository.findByListId(listId).stream()
                .map(CardResponse::from)
                .toList();
    }

    @Transactional
    public CardResponse createCard(CreateCardRequest request) {
        if (request.title() == null || request.title().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title is required");
        }
        TaskList list = taskListRepository.findById(request.listId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "List not found: " + request.listId()));

        Card card = new Card();
        card.setList(list);
        card.setTitle(request.title());
        card.setDescription(request.description());
        card.setOrder(cardRepository.countByListId(request.listId()));

        Card saved = cardRepository.save(card);
        return CardResponse.from(saved);
    }
}
