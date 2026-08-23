package com.taskmanagement.backend.controller;

import com.taskmanagement.backend.dto.CardResponse;
import com.taskmanagement.backend.service.CardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cards")
public class CardController {

    private final CardService cardService;

    public CardController(CardService cardService) {
        this.cardService = cardService;
    }

    @GetMapping
    public List<CardResponse> getCards(@RequestParam(required = false) UUID listId) {
        if (listId != null) {
            return cardService.getCardsByListId(listId);
        }
        return cardService.getAllCards();
    }

    @GetMapping("/{id}")
    public CardResponse getCard(@PathVariable UUID id) {
        return cardService.getCardById(id);
    }
}
